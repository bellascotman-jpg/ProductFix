'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(null); setMessage(null)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` })
    if (authError) setError(authError.message)
    else setMessage('If an account exists for that email, a password reset link has been sent.')
    setLoading(false)
  }

  return <AuthShell title="Reset your password" subtitle="We’ll send a secure reset link to your email."><form onSubmit={submit} className="space-y-5"><label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" /></label>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 font-medium text-white disabled:opacity-60">{loading ? 'Sending…' : 'Send reset link'}</button><p className="text-center text-sm text-slate-500"><Link href="/login" className="font-medium text-slate-950">Back to login</Link></p></form></AuthShell>
}
function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) { return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="block text-center text-lg font-semibold text-slate-950">StoreFix AI</Link><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-9"><h1 className="text-2xl font-semibold text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p><div className="mt-7">{children}</div></div></div></main> }
