'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'

export default function NewAuditPage() {
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setLoading(true)
    try {
      const response = await fetch('/api/audits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Unable to start audit.'); return }
      window.location.assign(`/dashboard/audits/${data.audit.id}`)
    } catch { setError('Network error. Check your connection and try again.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-slate-50"><div className="mx-auto max-w-3xl px-5 py-10 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft className="h-4 w-4" /> Dashboard</Link><div className="mt-12"><p className="text-sm font-medium text-slate-500">New audit</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Analyze your store.</h1><p className="mt-3 max-w-xl text-slate-600">Enter a public store URL. We’ll queue an evidence-based audit and show its processing status as the analysis progresses.</p><form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8"><label className="text-sm font-medium text-slate-800">Store URL<input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourstore.com" type="url" inputMode="url" autoComplete="url" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3.5 text-base outline-none focus:border-slate-400" /></label>{error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<button disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 font-medium text-white disabled:opacity-60">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Queueing audit…</> : 'Start Audit'}</button><div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /><p>Only publicly accessible pages are analyzed. StoreFix AI does not invent private analytics, revenue, customer behavior or inaccessible technical data.</p></div></form></div></div></main>
}
