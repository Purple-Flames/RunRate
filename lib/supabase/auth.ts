import { createClient } from './client'
import { isValidReauthenticationCode } from './reauthentication-code'

function authCallbackUrl(next?: string) {
  const redirectOrigin = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? window.location.origin
    : window.location.origin
  const callback = new URL('/auth/callback', redirectOrigin)
  if (next) callback.searchParams.set('next', next)
  return callback.toString()
}

export async function signInWithGoogle() {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl(),
    },
  })

  if (error) {
    throw error
  }
}

function toAccountSecurityError(error: { message: string; code?: string; status?: number }) {
  if (error.code === 'identity_already_exists' || error.code === 'identity_exists') {
    return new Error('That Google identity is already linked to a different RunRate account. Sign in to that account instead; no profile or financial data was changed.')
  }

  if (error.code === 'reauthentication_needed' || error.status === 401) {
    return new Error('Supabase requires you to reauthenticate before changing account sign-in methods. Please sign in again and retry.')
  }

  if (error.status === 429) {
    return new Error('Too many security attempts. Please wait before trying again.')
  }

  if (error.code === 'otp_expired' || error.code === 'otp_disabled' || error.code === 'invalid_otp' || error.code === 'otp_not_found' || error.code === 'bad_nonce' || error.code === 'invalid_grant' || error.code === 'invalid_credentials' || error.message.toLowerCase().includes('nonce')) {
    return new Error('That verification code is incorrect or expired. Check the code or request a new one.')
  }

  if (error.code === 'weak_password') {
    return new Error('Choose a stronger password and try again.')
  }

  return new Error('We could not complete this account change. Please try again.')
}

export async function requestReauthentication() {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user?.email || !user.email_confirmed_at) {
    throw new Error('Confirm the email address on this account before requesting a security code.')
  }

  const { error } = await supabase.auth.reauthenticate()
  if (error) {
    throw toAccountSecurityError(error)
  }

  return user.email
}

export async function setAccountPasswordWithReauthentication(password: string, email: string, token: string) {
  if (!isValidReauthenticationCode(token)) {
    throw new Error('Enter the complete 8-digit verification code from your email.')
  }

  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user?.email || user.email.toLowerCase() !== email.trim().toLowerCase()) {
    throw new Error('Your signed-in account changed. Refresh the page and request a new verification code.')
  }

  const { data, error } = await supabase.auth.updateUser({
    password,
    nonce: token,
  })

  if (error) {
    throw toAccountSecurityError(error)
  }
  if (!data.user) {
    throw new Error('Supabase did not confirm the password update. Please try again.')
  }
}

export async function linkGoogleIdentity() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: authCallbackUrl('/dashboard/settings'),
    },
  })

  if (error) {
    throw toAccountSecurityError(error)
  }

  return data
}

export async function setRecoveredAccountPassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    throw toAccountSecurityError(error)
  }
}

export async function requestPasswordRecovery(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: authCallbackUrl('/reset-password'),
  })

  if (error) {
    if (error.status === 429) throw new Error('Too many reset requests. Please wait a little before trying again.')
    throw new Error('We could not send a reset email right now. Please try again later.')
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authCallbackUrl(),
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    throw error
  }

  return data
}
