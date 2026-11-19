'use client'

import { FormEvent, Suspense, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { runrateImages } from '@/lib/images'
import { useRouter, useSearchParams } from 'next/navigation'
import { mutate } from 'swr'
import { requestPasswordRecovery, signInWithGoogle } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

function signInMessage(error: { message: string; status?: number; code?: string }) {
  if (error.status === 429) return 'Too many sign-in attempts. Please wait a little before trying again.'
  if (error.code === 'email_not_confirmed') return 'Check your email for a confirmation link before signing in.'
  if (error.code === 'invalid_credentials' || error.message.toLowerCase().includes('invalid login credentials')) return 'Invalid email or password.'
  if (error.status && error.status >= 500) return 'The sign-in service is temporarily unavailable. Please try again shortly.'
  return 'We could not sign you in. Please check your connection and try again.'
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')
  const callbackMessage = callbackError === 'missing_auth_code'
    ? 'This sign-in link is incomplete. Please try signing in again.'
    : callbackError === 'auth_callback_failed'
      ? 'We could not complete sign-in. Please try again.'
      : callbackError === 'missing_session'
        ? 'We could not confirm your session. Please sign in again.'
        : callbackError === 'google_oauth_cancelled'
          ? 'Google authorization was cancelled or could not be completed. You can try again or use your email and password.'
          : ''
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const loginInFlight = useRef(false)
  const [recovering, setRecovering] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loginInFlight.current) return

    loginInFlight.current = true
    setBusy(true)
    setMessage('')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setErrorMessage(signInMessage(error))
        return
      }
      if (!data.session) {
        setErrorMessage('Sign-in did not establish a session. Please try again.')
        return
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setErrorMessage('We could not confirm your session. Please try again.')
        return
      }

      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('category, currency, expenses, savings, income, target_monthly_income')
        .eq('id', user.id)
        .maybeSingle()
      if (profileError?.code === '42703' || profileError?.code === 'PGRST204') {
        const legacyResult = await supabase
          .from('profiles')
          .select('category, currency, expenses, savings, income')
          .eq('id', user.id)
          .maybeSingle()
        profile = legacyResult.data ? { ...legacyResult.data, target_monthly_income: null } : null
        profileError = legacyResult.error
      }
      if (profileError) {
        setErrorMessage('You are signed in, but we could not load your profile. Please try again.')
        return
      }

      await mutate('runrate:authenticated-profile', { userId: user.id, profile }, { revalidate: false })
      router.replace(profile ? '/dashboard' : '/onboarding')
      router.refresh()
    } catch {
      setErrorMessage('We could not complete sign-in. Check your connection and try again.')
    } finally {
      loginInFlight.current = false
      setBusy(false)
    }
  }

  async function handlePasswordRecovery() {
    setErrorMessage('')
    setMessage('')
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Enter a valid email address first.')
      return
    }

    setRecovering(true)
    try {
      await requestPasswordRecovery(email)
      setMessage('If an account exists for that email, a password-reset link will arrive shortly.')
    } catch (caught) {
      setErrorMessage(caught instanceof Error ? caught.message : 'We could not send a reset email. Please try again later.')
    } finally {
      setRecovering(false)
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
    <main className="flex min-h-screen min-h-[100dvh] w-full flex-1 items-center justify-center bg-[#FFFFFF] px-4 py-8 text-[#29252A] sm:px-8 lg:py-16">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <section className="hidden max-w-xl lg:block" aria-labelledby="login-promo-title">
          <Link href="/" className="mb-12 inline-flex items-center gap-2">
            <span className="flex items-end gap-1" aria-hidden="true"><span className="h-5 w-2 rounded-sm bg-[#54264F]" /><span className="h-8 w-2 rounded-sm bg-[#54264F]" /><span className="h-11 w-2 rounded-sm bg-[#54264F]" /></span>
            <span className="text-lg font-bold">Run<span className="text-[#54264F]">Rate</span></span>
          </Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#54264F]">Financial clarity for independent work</p>
          <h2 id="login-promo-title" className="mt-5 text-5xl font-bold leading-tight">Make your next move with confidence.</h2>
          <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-400">Understand your runway, price your work, and choose opportunities that support the life you&apos;re building.</p>
          <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-3xl"><Image src={runrateImages.phoneDecision} alt="Black African freelancer reflecting on a decision in a warmly lit library" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover object-[center_38%]" /></div>
        </section>

        <div className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-xl">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 sm:justify-start lg:hidden">
          <div className="flex items-end gap-1" aria-hidden="true">
            <span className="h-5 w-2 rounded-sm bg-[#54264F]" />
            <span className="h-8 w-2 rounded-sm bg-[#54264F]" />
            <span className="h-11 w-2 rounded-sm bg-[#54264F]" />
          </div>
          <span className="text-lg font-bold">Run<span className="text-[#54264F]">Rate</span></span>
        </Link>

        <div className="rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6 sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-base text-neutral-400">Log in to your account.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">Email address</label>
              <input id="email" type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6F3] px-4 py-3 text-base outline-none focus:border-[#54264F]" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <button type="button" onClick={handlePasswordRecovery} disabled={recovering || busy} className="min-h-11 text-sm text-[#54264F] underline-offset-4 hover:underline disabled:opacity-50">{recovering ? 'Sending…' : 'Forgot password?'}</button>
              </div>
              <div className="flex items-center rounded-lg border border-[#E9E3E9] bg-[#F8F6F3] pr-3 focus-within:border-[#54264F]"><input id="password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg bg-transparent px-4 py-3 text-base outline-none" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="min-h-10 px-2 text-xs font-semibold text-[#54264F]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div>
            </div>
            <button type="submit" disabled={busy || recovering} aria-busy={busy} className="min-h-11 w-full rounded-lg bg-[#54264F] px-4 py-3 font-semibold text-white hover:bg-[#421E3E] disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Signing in…' : 'Log in'}</button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-neutral-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={busy || recovering} className="min-h-11 w-full rounded-lg border border-[#E8E3ED] bg-[#F8F6F3] px-4 py-3 text-base font-medium hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">Continue with Google</button>
          {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{message}</p>}
          {(errorMessage || callbackMessage) && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errorMessage || callbackMessage}</p>}
          <p className="mt-6 text-center text-sm text-neutral-400">Don&apos;t have an account? <Link href="/signup" className="text-[#54264F] hover:underline">Sign up</Link></p>
        </div>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#29252A]"><p role="status" className="text-sm text-gray-400">Loading sign in…</p></main>}>
      <LoginForm />
    </Suspense>
  )
}
