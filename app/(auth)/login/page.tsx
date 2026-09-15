'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (authError) {
        setError(authError.message)
        return
      }
      window.location.assign('/dashboard')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <AuthShell title="Welcome back" subtitle="Sign in to continue to your store audits.">
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Email" type="email" value={email} onChange={setEmail} required autoComplete="email" />
      <Field label="Password" type="password" value={password} onChange={setPassword} required autoComplete="current-password" />
      <div className="flex justify-end"><Link href="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-950">Forgot password?</Link></div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Signing in…' : 'Log in'}</button>
      <p className="text-center text-sm text-slate-500">New to StoreFix AI? <Link href="/signup" className="font-medium text-slate-950">Create an account</Link></p>
    </form>
  </AuthShell>
}

function Field({ label, type, value, onChange, required, autoComplete }: { label: string; type: string; value: string; onChange: (value: string) => void; required?: boolean; autoComplete?: string }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} required={required} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400" /></label>
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="block text-center text-lg font-semibold text-slate-950">StoreFix AI</Link><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-9"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h1><p className="mt-2 text-sm text-slate-500">{subtitle}</p><div className="mt-7">{children}</div></div></div></main>
}
