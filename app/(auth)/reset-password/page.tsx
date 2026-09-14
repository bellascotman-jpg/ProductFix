'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event) => { if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') setReady(true) })
    return () => data.subscription.unsubscribe()
  }, [])

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setMessage(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) setError(updateError.message)
    else setMessage('Password updated. You can now log in with your new password.')
    setLoading(false)
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12"><div className="w-full max-w-md"><Link href="/" className="block text-center text-lg font-semibold text-slate-950">StoreFix AI</Link><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-soft sm:p-9"><h1 className="text-2xl font-semibold text-slate-950">Choose a new password</h1><p className="mt-2 text-sm text-slate-500">Use at least 8 characters.</p>{!ready ? <p className="mt-7 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Open this page from the password reset link in your email.</p> : <form onSubmit={submit} className="mt-7 space-y-5"><Field label="New password" value={password} onChange={setPassword} /><Field label="Confirm password" value={confirm} onChange={setConfirm} />{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}{message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}<button disabled={loading} className="w-full rounded-xl bg-slate-950 px-4 py-3.5 font-medium text-white disabled:opacity-60">{loading ? 'Updating…' : 'Update password'}</button></form>}</div></div></main>
}
function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="block text-sm font-medium text-slate-700">{label}<input required type="password" value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-400" /></label> }
