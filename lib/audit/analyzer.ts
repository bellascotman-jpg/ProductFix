export type AuditSignals = {
  titlePresent: boolean
  metaDescriptionPresent: boolean
  h1Count: number
  imageCount: number
  imagesMissingAlt: number
  linkCount: number
  ctaCount: number
  formCount: number
  priceSignals: number
  trustSignals: number
  productSignals: number
}

const CTA_WORDS = /shop now|buy now|add to cart|add to bag|subscribe|get started|learn more|view product|checkout|order now|book now/gi
const TRUST_WORDS = /free shipping|secure checkout|money back|returns?|refund|guarantee|verified|secure payment|customer support/gi
const PRODUCT_WORDS = /add to cart|add to bag|in stock|out of stock|sku|quantity|size|colour|color|variant/gi

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0
}

export function analyzeHtml(html: string, markdown: string, metadata: Record<string, unknown>): AuditSignals {
  const source = `${html}\n${markdown}`
  const titlePresent = /<title[^>]*>\s*[^<]+\s*<\/title>/i.test(html) || Boolean(metadata.title)
  const metaDescriptionPresent = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+?["']/i.test(html) || Boolean(metadata.description)
  const h1Count = html.match(/<h1\b[^>]*>/gi)?.length ?? 0
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? []
  const imagesMissingAlt = imageTags.filter((tag) => !/\balt\s*=\s*["'][^"']*["']/i.test(tag)).length
  const linkCount = html.match(/<a\b[^>]*href=/gi)?.length ?? 0
  const ctaCount = countMatches(source, CTA_WORDS)
  const formCount = html.match(/<form\b/gi)?.length ?? 0
  const priceSignals = countMatches(source, /(?:USD|EUR|GBP|NGN)\s?\d|\d[,.]?\d*\s?(?:USD|EUR|GBP|NGN)/gi)
  const trustSignals = countMatches(source, TRUST_WORDS)
  const productSignals = countMatches(source, PRODUCT_WORDS)
  return { titlePresent, metaDescriptionPresent, h1Count, imageCount: imageTags.length, imagesMissingAlt, linkCount, ctaCount, formCount, priceSignals, trustSignals, productSignals }
}
