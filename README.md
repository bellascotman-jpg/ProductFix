# ProductFix / StoreFix AI

Production-oriented e-commerce store auditing platform.

## Current foundation

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth and PostgreSQL integration
- Protected dashboard routes
- Evidence-first audit creation endpoint
- Persistent audit/job queue records
- Live audit status screen
- Responsive marketing and authentication UI
- No fake audit data, customer counts, reviews, metrics, or payment success

## Environment

Copy `.env.example` to `.env.local` and configure the Supabase public URL and anon key. Server integrations must use server-only environment variables.

## Audit architecture

An audit is created as `QUEUED` and persisted with an `audit_jobs` record. The crawler, deterministic analyzer, AI finding generator, scoring service, report generator, payment enforcement, observability and email delivery are separate integration boundaries. The UI never claims an audit is complete until the persisted audit state says it is.

## Database

The Supabase schema is maintained separately through migrations. Application queries enforce ownership in addition to database RLS.

## Security rules

Never commit `.env.local` or API keys. Never expose OpenAI, Firecrawl, Flutterwave, Resend or other server credentials to browser code. Payment success must be verified server-side. Public reports must use controlled share tokens and must not expose private account data.
