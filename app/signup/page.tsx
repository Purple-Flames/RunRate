'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import { signInWithGoogle, signUpWithEmail } from '@/lib/supabase/auth'

function signupErrorMessage(error: unknown) {
  const authError = error as { status?: number; code?: string } | null
  if (authError?.status === 429) return 'Too many account requests. Please wait before trying again.'
  if (authError?.code === 'weak_password') return 'Choose a stronger password and try again.'
  return 'We could not create an account with those details. Check the form or try signing in.'
}

export default function SignupPage() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setMessage('')
    const form = event.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value
    const terms = (form.elements.namedItem('terms') as HTMLInputElement).checked

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }
    if (!terms) {
      setErrorMessage('Agree to the Terms of Service and Privacy Policy to continue.')
      return
    }

    const fullName = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim()
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    setBusy(true)
    try {
      const { session } = await signUpWithEmail(email, password, fullName)
      if (session) {
        await mutate('runrate:authenticated-profile', undefined, { revalidate: false })
        router.replace('/onboarding')
      }
      else setMessage('Account created. Check your email for a confirmation link before signing in.')
    } catch (caught) {
      setErrorMessage(signupErrorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function handleGoogle() {
    setBusy(true)
    setErrorMessage('')
    try {
      await signInWithGoogle()
    } catch {
      setErrorMessage('Google sign-in could not be started. Please try again.')
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen min-h-[100dvh] w-full flex-1 items-center justify-center bg-[#FFFFFF] px-4 py-6 text-[#241d2e] sm:px-8 sm:py-8 lg:py-16">
      <div className="mx-auto w-full max-w-6xl rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <section className="hidden border-r border-[#E8E3ED] px-10 py-12 lg:block" aria-labelledby="signup-promo-title">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6842A6]">Build your financial foundation</p>
          <h2 id="signup-promo-title" className="mt-5 text-4xl font-bold leading-tight">A clearer picture starts here.</h2>
          <p className="mt-6 text-lg leading-8 text-neutral-400">Bring your income, expenses, and goals into focus with tools designed for independent professionals.</p>
        </section>
        <div>
        <header className="w-full px-5 py-5 sm:px-10 sm:py-7">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex items-end gap-1" aria-hidden="true"><span className="h-5 w-2 rounded-sm bg-[#6842A6]" /><span className="h-7 w-2 rounded-sm bg-[#6842A6]" /><span className="h-9 w-2 rounded-sm bg-[#6842A6]" /></span>
            <span className="text-lg font-bold">Run<span className="text-[#6842A6]">Rate</span></span>
          </Link>
        </header>

        <div className="w-full px-5 pb-8 sm:px-10">
          <h1 className="text-3xl font-bold sm:text-4xl">Create your account</h1>
          <p className="mt-2 text-base text-neutral-400">Start your journey with RunRate.</p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><label className="mb-2 block text-sm font-medium" htmlFor="full-name">Full name</label><input id="full-name" name="fullName" type="text" autoComplete="name" required maxLength={120} placeholder="Enter your full name" className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-base outline-none focus:border-[#6842A6]" /></div>
            <div><label className="mb-2 block text-sm font-medium" htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-base outline-none focus:border-[#6842A6]" /></div>
            <div><label className="mb-2 block text-sm font-medium" htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required placeholder="Create a password" className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-base outline-none focus:border-[#6842A6]" /></div>
            <div><label className="mb-2 block text-sm font-medium" htmlFor="confirm-password">Confirm password</label><input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required placeholder="Confirm your password" className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-base outline-none focus:border-[#6842A6]" /></div>
            <label className="flex min-h-11 items-start gap-3 text-sm text-neutral-400 sm:col-span-2"><input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[#6842A6]" /><span>I agree to the Terms of Service and Privacy Policy.</span></label>
            <button type="submit" disabled={busy} className="min-h-11 w-full rounded-lg bg-[#6842A6] px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2">{busy ? 'Creating account…' : 'Create account'}</button>
          </form>

          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/10" /><span className="text-xs text-neutral-500">or</span><div className="h-px flex-1 bg-white/10" /></div>
          <button type="button" onClick={handleGoogle} disabled={busy} className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-base font-medium disabled:cursor-not-allowed disabled:opacity-50">Continue with Google</button>
          {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-green-900 bg-green-950/30 p-3 text-sm text-green-200">{message}</p>}
          {errorMessage && <p role="alert" className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-200">{errorMessage}</p>}
          <p className="mt-6 text-center text-sm text-neutral-400">Already have an account? <Link href="/login" className="text-[#6842A6] hover:underline">Log in</Link></p>
        </div>
        </div>
      </div>
    </main>
  )
}
