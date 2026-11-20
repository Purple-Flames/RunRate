'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setRecoveredAccountPassword } from '@/lib/supabase/auth'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
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
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10 text-[#29252A]">
      <section className="w-full max-w-md rounded-2xl border border-[#E8E3ED] bg-white p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-[#54264F] hover:underline">RunRate</Link>
        <h1 className="mt-6 text-3xl font-bold">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">Use the form below after opening the password-reset link from your email.</p>
        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label htmlFor="new-password" className="grid gap-2 text-sm font-medium">New password<input id="new-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 rounded-lg border border-[#E8E3ED] bg-[#F8F6F3] px-4 py-3 text-[#29252A] outline-none focus:border-[#54264F]" /></label>
          <label htmlFor="confirm-password" className="grid gap-2 text-sm font-medium">Confirm password<input id="confirm-password" type={showPasswords ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-h-11 rounded-lg border border-[#E8E3ED] bg-[#F8F6F3] px-4 py-3 text-[#29252A] outline-none focus:border-[#54264F]" /></label>
          <button type="button" onClick={() => setShowPasswords((value) => !value)} className="min-h-10 justify-self-start text-sm font-semibold text-[#54264F] hover:underline" aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? 'Hide passwords' : 'Show passwords'}</button>
          <button type="submit" disabled={busy || !password || !confirmPassword} className="min-h-11 rounded-lg bg-[#54264F] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Saving password…' : 'Save new password'}</button>
        </form>
        {error && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      </section>
    </main>
  )
}
