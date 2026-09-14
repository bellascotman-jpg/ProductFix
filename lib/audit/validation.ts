export function normalizeStoreUrl(input: string): { url: string; domain: string } | { error: string } {
  const value = input.trim()
  if (!value) return { error: 'Enter your store URL.' }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  let parsed: URL
  try { parsed = new URL(candidate) } catch { return { error: 'Enter a valid website URL.' } }

  if (!['http:', 'https:'].includes(parsed.protocol)) return { error: 'Only HTTP and HTTPS URLs are supported.' }
  if (!parsed.hostname || parsed.hostname.includes('localhost') || parsed.hostname.endsWith('.local')) return { error: 'Enter a public store URL that can be accessed from the internet.' }
  if (parsed.username || parsed.password) return { error: 'URLs containing embedded credentials are not allowed.' }

  parsed.hash = ''
  parsed.search = ''
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
  return { url: parsed.toString(), domain: parsed.hostname.toLowerCase() }
}
