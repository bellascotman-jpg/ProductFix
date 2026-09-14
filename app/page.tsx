import Link from 'next/link'
import { ArrowRight, Check, Search, ShieldCheck, Sparkles } from 'lucide-react'

const categories = ['Conversion', 'User experience', 'Product experience', 'Trust', 'Copy', 'SEO', 'Mobile']

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">StoreFix AI</Link>
        <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
          <a href="#how-it-works">How it works</a>
          <a href="#audit">What we audit</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login" className="font-medium text-slate-950">Log in</Link>
          <Link href="/signup" className="rounded-xl bg-slate-950 px-4 py-2.5 font-medium text-white">Audit My Store</Link>
        </nav>
        <Link href="/login" className="text-sm font-medium text-slate-950 md:hidden">Log in</Link>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-16 text-center lg:px-8 lg:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Evidence-based store audits
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl">Find what’s costing your store sales.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">StoreFix AI analyzes your e-commerce store and turns hidden conversion problems into clear, prioritized fixes.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 font-medium text-white shadow-soft">Audit My Store <ArrowRight className="h-4 w-4" /></Link>
          <a href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 font-medium text-slate-800">See How It Works</a>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-soft sm:grid-cols-3">
          {[['01', 'Enter your store URL', 'Give StoreFix AI the public URL you want analyzed.'], ['02', 'We inspect what shoppers see', 'The audit gathers observable page, content, UX and trust signals.'], ['03', 'Get prioritized fixes', 'Receive findings with evidence, impact and implementation guidance.']].map(([number, title, body]) => (
            <div key={number} className="border-b border-slate-200 p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <span className="text-xs font-semibold text-slate-400">{number}</span>
              <h2 className="mt-5 font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="audit" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="max-w-2xl"><p className="text-sm font-semibold text-slate-500">A practical audit, not a vanity score</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">See the problems. Understand the reason. Know the fix.</h2><p className="mt-4 leading-7 text-slate-600">Every finding is tied to observable evidence from the pages we can access. When evidence is insufficient, StoreFix AI says so instead of inventing an answer.</p></div>
          <div className="mt-10 flex flex-wrap gap-3">{categories.map((category) => <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">{category}</span>)}</div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature icon={<Search />} title="Evidence first" body="Structured page signals are collected before AI interpretation, keeping recommendations grounded in what was actually observed." />
          <Feature icon={<ShieldCheck />} title="No invented metrics" body="StoreFix AI does not claim private revenue, conversion rates, customer behavior or analytics it cannot access." />
          <Feature icon={<Check />} title="Actionable output" body="Findings explain the problem, why it matters, what to change and how to implement the fix." />
        </div>
      </section>

      <section id="pricing" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8"><p className="text-sm font-semibold text-slate-500">Pricing</p><h2 className="mt-3 text-3xl font-semibold text-slate-950">Choose a plan when billing is connected.</h2><p className="mx-auto mt-4 max-w-xl text-slate-600">Payment and usage limits will be enforced server-side through the configured Flutterwave integration. No fake checkout is shown here.</p></div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><span>© {new Date().getFullYear()} StoreFix AI</span><span>Evidence-based e-commerce improvement.</span></footer>
    </main>
  )
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">{icon}</div><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>
}
