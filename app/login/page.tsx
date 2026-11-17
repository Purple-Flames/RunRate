'use client'

import { FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { mutate } from 'swr'
import { requestPasswordRecovery, signInWithGoogle } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/client'

function signInMessage(error: { message: string; status?: number; code?: string }) {
  if (error.status === 429) return 'Too many sign-in attempts. Please wait a little before trying again.'
  if (error.code === 'email_not_confirmed') return 'Check your email for a confirmation link before signing in.'
  if (error.message.toLowerCase().includes('invalid login credentials')) return 'Invalid email or password.'
  return 'We could not sign you in. Check your details and try again.'
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
        : ''
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [recovering, setRecovering] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setErrorMessage('')
    const form = event.currentTarget
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setErrorMessage(signInMessage(error))
        return
      }
      await mutate('runrate:authenticated-profile', undefined, { revalidate: false })

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setErrorMessage('We could not confirm your session. Please sign in again.')
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()
      if (profileError) {
        setErrorMessage('You are signed in, but we could not load your profile. Please try again.')
        return
      }
      router.replace(profile ? '/dashboard' : '/onboarding')
    } catch {
      setErrorMessage('We could not sign you in. Please check your connection and try again.')
    } finally {
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
    <main className="flex min-h-screen min-h-[100dvh] w-full items-center justify-center bg-[#050505] px-4 py-8 text-white sm:px-8">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 sm:justify-start">
          <div className="flex items-end gap-1" aria-hidden="true">
            <span className="h-5 w-2 rounded-sm bg-[#D4AF37]" />
            <span className="h-8 w-2 rounded-sm bg-[#D4AF37]" />
            <span className="h-11 w-2 rounded-sm bg-[#D4AF37]" />
          </div>
          <span className="text-lg font-bold">Run<span className="text-[#D4AF37]">Rate</span></span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
          <h1 className="text-3xl font-bold sm:text-4xl">Welcome back</h1>
          <p className="mt-2 text-base text-neutral-400">Log in to your account.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">Email address</label>
              <input id="email" type="email" name="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-11 w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]" />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium" htmlFor="password">Password</label>
                <button type="button" onClick={handlePasswordRecovery} disabled={recovering || busy} className="min-h-11 text-sm text-[#D4AF37] underline-offset-4 hover:underline disabled:opacity-50">{recovering ? 'Sending…' : 'Forgot password?'}</button>
              </div>
              <input id="password" type="password" name="password" autoComplete="current-password" required className="min-h-11 w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]" />
            </div>
            <button type="submit" disabled={busy || recovering} className="min-h-11 w-full rounded-lg bg-[#D4AF37] px-4 py-3 font-semibold text-black hover:bg-[#e1bd43] disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Signing in…' : 'Log in'}</button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-neutral-500">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={busy || recovering} className="min-h-11 w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-base font-medium hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50">Continue with Google</button>
          {message && <p role="status" aria-live="polite" className="mt-4 rounded-lg border border-green-900 bg-green-950/30 p-3 text-sm text-green-200">{message}</p>}
          {(errorMessage || callbackMessage) && <p role="alert" className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-200">{errorMessage || callbackMessage}</p>}
          <p className="mt-6 text-center text-sm text-neutral-400">Don&apos;t have an account? <Link href="/signup" className="text-[#D4AF37] hover:underline">Sign up</Link></p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><p role="status" className="text-sm text-gray-400">Loading sign in…</p></main>}>
      <LoginForm />
    </Suspense>
  )
}
