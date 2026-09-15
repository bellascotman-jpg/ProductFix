# StoreFix AI

**Evidence-first e-commerce store auditing software.**

StoreFix AI helps store owners identify observable conversion, UX, SEO, trust, and merchandising problems on public storefront pages and turn those findings into a prioritized action plan.

## Product principles

- **Evidence first:** findings should be grounded in observable storefront evidence.
- **Actionable output:** every meaningful issue should explain why it matters and what to fix.
- **No fabricated proof:** never invent customer counts, reviews, audit results, scores, payment confirmations, or business metrics.
- **Secure by default:** server credentials stay server-side; authenticated data is protected by ownership checks and Supabase RLS.
- **Honest audit state:** the interface only presents an audit as complete when the persisted backend state says it is complete.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Firecrawl for public-page crawling
- Server-side audit processing and persisted job state
- GitHub Actions CI
- Designed for Vercel deployment

## Architecture

An audit begins as `QUEUED`, is persisted in `audits` and `audit_jobs`, then moves through crawling, analysis, findings generation, scoring, and report generation. Provider callbacks are verified before they can update audit state.

The application separates provider integrations from deterministic analysis so external services can fail without causing the UI to claim false success.

## Security

- Never commit `.env.local`, API keys, service-role keys, or webhook secrets.
- Never expose OpenAI, Firecrawl, Flutterwave, Resend, Supabase service-role, or other server credentials to browser code.
- Store URLs are validated before crawling, including rejection of localhost, local/internal domains, and private IP literals.
- Firecrawl webhook signatures are verified before processing callbacks.
- User-facing audit queries enforce ownership in addition to database RLS.
- Public reports should use controlled share tokens and must not expose private account data.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Configure the Supabase public URL and anon key.
3. Configure server-only integration secrets required by the features you enable.
4. Install dependencies with `npm install`.
5. Start the development server with `npm run dev`.
6. Run `npm run typecheck` before committing.
7. Run `npm run build` to verify a production build.

## Environment

See `.env.example` for the supported configuration surface. Keep public browser variables limited to values that are explicitly safe to expose.

## Project status

StoreFix AI is being developed as a production-oriented product. Integrations that are not configured must fail clearly rather than silently pretending to work.

## Author

**Bella Scotman** — Builder focused on AI products, software engineering, mathematics, and practical technology for business.

GitHub: `bellascotman-jpg`
