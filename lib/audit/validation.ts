import { isIP } from 'node:net'

function isBlockedIp(hostname: string) {
  const version = isIP(hostname)
  if (version === 6) {
    const value = hostname.toLowerCase()
    return value === '::1' || value === '::' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:')
  }

  if (version !== 4) return false
  const octets = hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => octet < 0 || octet > 255)) return true
  const [a, b] = octets
  return (
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 0)
  )
}

export function normalizeStoreUrl(input: string): { url: string; domain: string } | { error: string } {
  const value = input.trim()
  if (!value) return { error: 'Enter your store URL.' }
  if (value.length > 2048) return { error: 'The store URL is too long.' }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  let parsed: URL
  try { parsed = new URL(candidate) } catch { return { error: 'Enter a valid website URL.' } }

  if (!['http:', 'https:'].includes(parsed.protocol)) return { error: 'Only HTTP and HTTPS URLs are supported.' }
  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.local') || hostname.endsWith('.internal') || isBlockedIp(hostname)) {
    return { error: 'Enter a public store URL that can be accessed from the internet.' }
  }
  if (!hostname.includes('.') && !hostname.startsWith('www.')) return { error: 'Enter a public store domain.' }
  if (parsed.username || parsed.password) return { error: 'URLs containing embedded credentials are not allowed.' }

  parsed.hostname = hostname
  parsed.hash = ''
  parsed.search = ''
  parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/'
  return { url: parsed.toString(), domain: hostname }
}
