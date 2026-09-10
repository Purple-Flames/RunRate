import { createClient } from './client'

export async function signInWithGoogle() {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `https://crispy-giggle-wvgg9r47677725gxg-3000.app.github.dev/auth/callback`,
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
