import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { analyzeHtml } from '@/lib/audit/analyzer'
import type { FirecrawlWebhookEvent } from '@/lib/audit/firecrawl'

export const runtime = 'nodejs'

function validSignature(rawBody: string, signature: string | null) {
  const secret = process.env.FIRECRAWL_WEBHOOK_SECRET
  if (!secret || !signature) return false
  const expected = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
  const left = Buffer.from(expected)
  const right = Buffer.from(signature)
  return left.length === right.length && timingSafeEqual(left, right)
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  if (!validSignature(rawBody, request.headers.get('x-firecrawl-signature'))) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 })

  let event: FirecrawlWebhookEvent
  try { event = JSON.parse(rawBody) as FirecrawlWebhookEvent } catch { return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 }) }
  const auditId = typeof event.metadata?.auditId === 'string' ? event.metadata.auditId : null
  if (!auditId) return NextResponse.json({ received: true })

  const admin = createAdminClient()
  const { data: job } = await admin.from('audit_jobs').select('id, audit_id, provider_job_id').eq('audit_id', auditId).eq('provider', 'firecrawl').single()
  if (!job || job.provider_job_id !== event.id) return NextResponse.json({ received: true })

  if (event.type === 'crawl.started') {
    await admin.from('audits').update({ status: 'CRAWLING', current_stage: 'CRAWLING' }).eq('id', auditId)
    return NextResponse.json({ received: true })
  }

  if (event.type === 'crawl.page') {
    for (const page of event.data ?? []) {
      const metadata = page.metadata ?? {}
      const url = typeof metadata.sourceURL === 'string' ? metadata.sourceURL : typeof metadata.url === 'string' ? metadata.url : null
      if (!url) continue
      const html = typeof page.html === 'string' ? page.html : ''
      const markdown = typeof page.markdown === 'string' ? page.markdown : ''
      const signals = analyzeHtml(html, markdown, metadata)
      await admin.from('audit_pages').upsert({ audit_id: auditId, url, page_type: 'unknown', title: typeof metadata.title === 'string' ? metadata.title : null, status: typeof metadata.statusCode === 'number' && metadata.statusCode >= 200 && metadata.statusCode < 400 ? 'COMPLETED' : 'FAILED', content: { markdown, html }, metadata, signals, crawled_at: new Date().toISOString(), provider_event_id: event.webhookId }, { onConflict: 'provider_event_id' })
    }
    return NextResponse.json({ received: true })
  }

  if (event.type === 'crawl.completed') {
    await admin.from('audit_jobs').update({ status: 'COMPLETED', completed_at: new Date().toISOString() }).eq('id', job.id)
    await admin.from('audits').update({ status: 'ANALYZING', current_stage: 'ANALYZING' }).eq('id', auditId)
    return NextResponse.json({ received: true })
  }

  if (event.type === 'crawl.failed') {
    const message = event.error || 'Firecrawl could not complete the website crawl.'
    await admin.from('audit_jobs').update({ status: 'FAILED', last_error: message, completed_at: new Date().toISOString() }).eq('id', job.id)
    await admin.from('audits').update({ status: 'CRAWL_FAILED', current_stage: 'CRAWLING', failed_at: new Date().toISOString(), error_code: 'CRAWL_FAILED', error_message: message }).eq('id', auditId)
  }

  return NextResponse.json({ received: true })
}
