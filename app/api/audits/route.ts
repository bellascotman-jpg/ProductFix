import { createClient } from '@/lib/supabase/server'
import { normalizeStoreUrl } from '@/lib/audit/validation'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }
  const rawUrl = typeof body === 'object' && body !== null && 'url' in body && typeof body.url === 'string' ? body.url : ''
  const normalized = normalizeStoreUrl(rawUrl)
  if ('error' in normalized) return NextResponse.json({ error: normalized.error }, { status: 400 })

  const { data: existing } = await supabase.from('audits').select('id, status').eq('user_id', user.id).eq('normalized_url', normalized.url).in('status', ['DRAFT', 'QUEUED', 'CRAWLING', 'ANALYZING', 'GENERATING_FINDINGS', 'SCORING', 'GENERATING_REPORT']).limit(1).maybeSingle()
  if (existing) return NextResponse.json({ error: 'An audit for this store is already processing.', auditId: existing.id }, { status: 409 })

  const { data: audit, error } = await supabase.from('audits').insert({ user_id: user.id, store_url: rawUrl.trim(), normalized_url: normalized.url, domain: normalized.domain, status: 'QUEUED', current_stage: 'QUEUED' }).select('id, status, current_stage').single()
  if (error || !audit) return NextResponse.json({ error: 'Could not create the audit. Please try again.' }, { status: 500 })

  const { error: jobError } = await supabase.from('audit_jobs').insert({ audit_id: audit.id, status: 'QUEUED', attempt_count: 0, available_at: new Date().toISOString() })
  if (jobError) {
    await supabase.from('audits').delete().eq('id', audit.id).eq('user_id', user.id)
    return NextResponse.json({ error: 'Could not queue the audit. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ audit }, { status: 201 })
}
