'use client'

import { FormEvent, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  completeReauthentication,
  linkGoogleIdentity,
  requestReauthentication,
  setAccountPassword,
} from '@/lib/supabase/auth'

export default function AccountSettingsPage() {
  const [hasGoogle, setHasGoogle] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reauthEmail, setReauthEmail] = useState('')
  const [reauthToken, setReauthToken] = useState('')
  const [reauthPending, setReauthPending] = useState(false)

  useEffect(() => {
    const loadIdentities = async () => {
      const supabase = createClient()
      const { data, error: identityError } = await supabase.auth.getUserIdentities()
      if (identityError) {
        setError('We could not verify the sign-in methods on this account. Refresh and try again.')
        return
      }

      const identities = data?.identities ?? []
      setHasGoogle(identities.some((identity) => identity.provider === 'google'))
      setHasPassword(identities.some((identity) => identity.provider === 'email'))
    }

    void loadIdentities()
  }, [])

  const requestSecurityCode = async () => {
    setBusy(true)
    setMessage('')
    setError('')
    try {
      const email = await requestReauthentication()
      setReauthEmail(email)
      setReauthPending(true)
      setMessage('A verification code was sent to your account email. Enter it below to continue.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not start reauthentication.')
    } finally {
      setBusy(false)
    }
  }

  const handleLinkGoogle = async () => {
    if (!reauthPending || !reauthToken) {
      await requestSecurityCode()
      return
    }

    setBusy(true)
    setMessage('')
    setError('')
    try {
      await completeReauthentication(reauthEmail, reauthToken)
      await linkGoogleIdentity()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google could not be linked.')
    } finally {
      setBusy(false)
    }
  }

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')
    if (password.length < 8) {
      setError('Use at least 8 characters for your password.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!reauthPending || !reauthToken) {
      await requestSecurityCode()
      return
    }

    setBusy(true)
    try {
      await completeReauthentication(reauthEmail, reauthToken)
      await setAccountPassword(password)
      setHasPassword(true)
      setPassword('')
      setConfirmPassword('')
      setReauthToken('')
      setReauthPending(false)
      setMessage('Your password is set. You can now use email and password to sign in.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Password could not be updated.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <a href="/dashboard" className="text-sm text-[#d4af37] hover:underline">← Back to dashboard</a>
        <header className="mt-8 border-b border-[#3b321c] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d4af37]">RunRate</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Account Settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">Securely manage the sign-in methods attached to this account. Your existing profile and financial data stay attached to the same user ID.</p>
        </header>

        <div className="mt-8 grid gap-6">
          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Verify before changing sign-in methods</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">RunRate asks Supabase to reauthenticate you before linking Google or setting a password. This keeps your existing user ID, profile, and financial data unchanged.</p>
            <div className="mt-5 grid gap-3 sm:max-w-md">
              <button type="button" onClick={requestSecurityCode} disabled={busy} className="rounded-lg border border-[#d4af37] px-4 py-3 text-sm font-semibold text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? 'Sending verification code…' : 'Send verification code'}
              </button>
              {reauthPending && (
                <label className="grid gap-2 text-sm font-medium" htmlFor="reauth-token">
                  Verification code
                  <input id="reauth-token" inputMode="numeric" autoComplete="one-time-code" value={reauthToken} onChange={(event) => setReauthToken(event.target.value)} className="rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#d4af37]" />
                </label>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Google sign-in</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Link Google to this signed-in account. RunRate will not merge another account or profile based on an email address.</p>
            <button type="button" onClick={handleLinkGoogle} disabled={busy || hasGoogle} className="mt-5 rounded-lg bg-[#d4af37] px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">
              {hasGoogle ? 'Google is linked' : busy ? 'Preparing secure link…' : 'Link Google account'}
            </button>
          </section>

          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Email and password</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Set or update a password for this account. Reauthentication is required before this sensitive change.</p>
            <form onSubmit={handlePassword} className="mt-5 grid gap-4 sm:max-w-md">
              <label className="grid gap-2 text-sm font-medium" htmlFor="new-password">New password<input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#d4af37]" /></label>
              <label className="grid gap-2 text-sm font-medium" htmlFor="confirm-password">Confirm password<input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#d4af37]" /></label>
              <button type="submit" disabled={busy || !password || !confirmPassword} className="rounded-lg border border-[#d4af37] px-4 py-3 text-sm font-semibold text-[#d4af37] disabled:cursor-not-allowed disabled:opacity-50">{hasPassword ? 'Update password' : 'Set password'}</button>
            </form>
          </section>

          {message && <p role="status" className="rounded-lg border border-green-800 bg-green-950/40 p-4 text-sm text-green-200">{message}</p>}
          {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
        </div>
      </div>
    </main>
  )
}
