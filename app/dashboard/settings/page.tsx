'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  linkGoogleIdentity,
  requestReauthentication,
  setAccountPasswordWithReauthentication,
} from '@/lib/supabase/auth'
import { isValidReauthenticationCode, REAUTHENTICATION_CODE_LENGTH } from '@/lib/supabase/reauthentication-code'

export default function AccountSettingsPage() {
  const router = useRouter()
  const [hasGoogle, setHasGoogle] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [accountAvailable, setAccountAvailable] = useState(false)
  const [identitiesLoading, setIdentitiesLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reauthEmail, setReauthEmail] = useState('')
  const [reauthToken, setReauthToken] = useState('')
  const [reauthPending, setReauthPending] = useState(false)
  const [reauthenticated, setReauthenticated] = useState(false)

  useEffect(() => {
    let active = true
    const loadIdentities = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError?.name === 'AuthSessionMissingError' || (!user && !userError)) {
          router.replace('/login')
          return
        }
        if (userError || !user) throw new Error('session')

        const { data, error: identityError } = await supabase.auth.getUserIdentities()
        if (identityError) throw identityError
        if (!active) return

        const identities = data?.identities ?? []
        setHasGoogle(identities.some((identity) => identity.provider === 'google'))
        setHasPassword(identities.some((identity) => identity.provider === 'email'))
        setAccountAvailable(true)
      } catch {
        if (active) setError('We could not verify this account. Please sign in again and retry.')
      } finally {
        if (active) setIdentitiesLoading(false)
      }
    }

    void loadIdentities()
    return () => { active = false }
  }, [router])

  const requestSecurityCode = async () => {
    if (!accountAvailable || busy) return
    setBusy(true)
    setMessage('')
    setError('')
    setReauthenticated(false)
    setReauthPending(false)
    setReauthToken('')
    try {
      const email = await requestReauthentication()
      setReauthEmail(email)
      setReauthPending(true)
      setMessage('If this account can receive verification codes, one has been sent. Enter all 8 digits with your new password below.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'We could not start verification.')
    } finally {
      setBusy(false)
    }
  }

  const handleLinkGoogle = async () => {
    if (!reauthenticated) {
      setError('Verify your identity before linking Google.')
      return
    }

    setBusy(true)
    setMessage('')
    setError('')
    try {
      await linkGoogleIdentity()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Google could not be linked.')
      setBusy(false)
    }
  }

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!reauthPending) {
      setError('Request a new verification code before changing your password.')
      return
    }
    if (!isValidReauthenticationCode(reauthToken)) {
      setError('Enter the complete 8-digit verification code from your email.')
      return
    }
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
      await setAccountPasswordWithReauthentication(password, reauthEmail, reauthToken)
      setHasPassword(true)
      setPassword('')
      setConfirmPassword('')
      setReauthToken('')
      setReauthPending(false)
      setReauthenticated(true)
      setMessage('Supabase confirmed the password update. The verification code was submitted as the password-update nonce. You can now use email and password to sign in or link Google.')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Password could not be updated.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link href="/dashboard" className="text-sm text-[#D4AF37] hover:underline">← Back to dashboard</Link>
        <header className="mt-8 border-b border-[#3b321c] pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">RunRate</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Account Settings</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">Securely manage the sign-in methods attached to this account. Your existing profile and financial data stay attached to the same user ID.</p>
        </header>

        <div className="mt-8 grid gap-6">
          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Verify before changing sign-in methods</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">The eight-digit Supabase reauthentication code is submitted as the password-update nonce together with your new password in one operation. Google linking stays unavailable until this operation succeeds.</p>
            <div className="mt-5 grid gap-3 sm:max-w-md">
              <button type="button" onClick={requestSecurityCode} disabled={busy || identitiesLoading || !accountAvailable} className="min-h-11 rounded-lg border border-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50">
                {identitiesLoading ? 'Checking account…' : busy ? 'Please wait…' : reauthPending ? 'Send a new verification code' : 'Send verification code'}
              </button>
              {reauthPending && <p className="text-sm text-gray-300">A code was requested for {reauthEmail}. Enter all 8 digits with your password below.</p>}
              {reauthenticated && <p className="text-sm text-emerald-300">Supabase confirmed your password update using the verification code. Google linking is available for this session.</p>}
            </div>
          </section>

          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Google sign-in</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">Link Google to this signed-in account. RunRate will not merge another account or profile based on an email address.</p>
            <p className="mt-3 text-sm text-gray-300">{identitiesLoading ? 'Checking linked accounts…' : hasGoogle ? 'Google is linked to this account.' : 'Google is not linked.'}</p>
            <button type="button" onClick={handleLinkGoogle} disabled={busy || identitiesLoading || !accountAvailable || hasGoogle || !reauthenticated} className="mt-5 min-h-11 rounded-lg bg-[#D4AF37] px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50">
              {hasGoogle ? 'Google is linked' : busy ? 'Preparing secure link…' : 'Link Google account'}
            </button>
          </section>

          <section className="rounded-2xl border border-[#3b321c] bg-[#11100b] p-5 sm:p-7">
            <h2 className="text-xl font-semibold">Email and password</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{hasPassword ? 'Update the password for this account.' : 'Set a password to enable email and password sign-in.'} Request a fresh code above, then submit it with your password so Supabase can validate the nonce in the password update.</p>
            <form onSubmit={handlePassword} className="mt-5 grid gap-4 sm:max-w-md">
              {reauthPending && <label className="grid gap-2 text-sm font-medium" htmlFor="reauth-token">Eight-digit verification code<input id="reauth-token" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={REAUTHENTICATION_CODE_LENGTH} pattern={`[0-9]{${REAUTHENTICATION_CODE_LENGTH}}`} required value={reauthToken} onChange={(event) => setReauthToken(event.target.value.replace(/\D/g, '').slice(0, REAUTHENTICATION_CODE_LENGTH))} aria-describedby="reauth-token-help" className="min-h-11 rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#D4AF37]" /><span id="reauth-token-help" className="text-xs text-gray-400">Enter all 8 digits. Incorrect, expired, or reused codes must be rejected by Supabase.</span></label>}
              <label className="grid gap-2 text-sm font-medium" htmlFor="new-password">New password<input id="new-password" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="min-h-11 rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#D4AF37]" /></label>
              <label className="grid gap-2 text-sm font-medium" htmlFor="confirm-password">Confirm password<input id="confirm-password" type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="min-h-11 rounded-lg border border-[#4b4024] bg-black px-3 py-3 text-white outline-none focus:border-[#D4AF37]" /></label>
              <button type="submit" disabled={busy || identitiesLoading || !accountAvailable || !reauthPending || !password || !confirmPassword} className="min-h-11 rounded-lg border border-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Updating password…' : hasPassword ? 'Update password' : 'Set password'}</button>
            </form>
          </section>

          {message && <p role="status" aria-live="polite" className="rounded-lg border border-green-800 bg-green-950/40 p-4 text-sm text-green-200">{message}</p>}
          {error && <p role="alert" className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
        </div>
      </div>
    </main>
  )
}
