import { createClient } from './client'

export async function signInWithGoogle() {
  const supabase = createClient()
  const redirectOrigin =
    process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? window.location.origin
      : window.location.origin

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${redirectOrigin}/auth/callback`,
    },
  })

  if (error) {
    throw error
  }
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
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
