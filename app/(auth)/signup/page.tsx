'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null); setMessage(null); setLoading(true)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } })
    if (authError) setError(authError.message)
    else if (data.session) window.location.assign('/dashboard')
    else setMessage('Account created. Check your email to confirm your address, then log in.')
    setLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="block text-center text-lg font-semibold text-slate-950">StoreFix AI</Link><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-9"><h1 className="text-2xl font-semibold tracking-tight text-slate-950">Create your account</h1><p className="mt-2 text-sm text-slate-500">Start turning visible store problems into prioritized fixes.</p><form onSubmit={handleSubmit} className="mt-7 space-y-5"><Field label="Full name" type="text" value={name} onChange={setName} required /><Field label="Email" type="email" value={email} onChange={setEmail} required /><Field label="Password" type="password" value={password} onChange={setPassword} required />{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 font-medium text-white disabled:opacity-60">{loading ? 'Creating account…' : 'Create account'}</button><p className="text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-medium text-slate-950">Log in</Link></p></form></div></div></main>
}
function Field({ label, type, value, onChange, required }: { label: string; type: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-slate-400" /></label> }
