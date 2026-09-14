export type FirecrawlPage = {
  markdown?: string
  html?: string
  links?: string[]
  metadata?: Record<string, unknown>
}

export type FirecrawlWebhookEvent = {
  success: boolean
  type: string
  id: string
  webhookId: string
  data: FirecrawlPage[]
  metadata?: Record<string, unknown>
  error?: string
}

function getConfig() {
  const apiKey = process.env.FIRECRAWL_API_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!apiKey || !appUrl) throw new Error('Firecrawl integration is not configured.')
  return { apiKey, appUrl: appUrl.replace(/\/$/, '') }
}

export async function startFirecrawlAudit(url: string, auditId: string) {
  const { apiKey, appUrl } = getConfig()
  const response = await fetch('https://api.firecrawl.dev/v2/crawl', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      limit: 30,
      crawlEntireDomain: true,
      ignoreQueryParameters: true,
      scrapeOptions: { formats: ['markdown', 'html', 'links'], onlyMainContent: false, timeout: 60000 },
      webhook: {
        url: `${appUrl}/api/webhooks/firecrawl`,
        metadata: { auditId },
        events: ['started', 'page', 'completed', 'failed'],
      },
    }),
  })
  const payload = await response.json() as { success?: boolean; id?: string; error?: string }
  if (!response.ok || !payload.id) throw new Error(payload.error || `Firecrawl returned HTTP ${response.status}.`)
  return payload.id
}
