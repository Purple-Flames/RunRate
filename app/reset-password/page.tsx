'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setRecoveredAccountPassword } from '@/lib/supabase/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await setRecoveredAccountPassword(password)
      router.replace('/dashboard')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'This reset link may have expired. Request a new one and try again.')
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-[#D4AF37] hover:underline">RunRate</Link>
        <h1 className="mt-6 text-3xl font-bold">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">Use the form below after opening the password-reset link from your email.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label htmlFor="new-password" className="grid gap-2 text-sm font-medium">New password<input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#D4AF37]" /></label>
          <label htmlFor="confirm-password" className="grid gap-2 text-sm font-medium">Confirm password<input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-h-11 rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-white outline-none focus:border-[#D4AF37]" /></label>
          <button type="submit" disabled={busy || !password || !confirmPassword} className="min-h-11 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Saving password…' : 'Save new password'}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      </section>
    </main>
  )
}
