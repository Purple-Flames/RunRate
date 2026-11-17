'use client'

import useSWR from 'swr'
import { createClient } from './client'

export type UserProfile = {
  category: string | string[] | null
  currency: string
  expenses: number | string
  savings: number | string
  income: number | string
}

type AuthenticatedProfile = {
  userId: string
  profile: UserProfile | null
}

export const PROFILE_CACHE_KEY = 'runrate:authenticated-profile'

async function fetchAuthenticatedProfile(): Promise<AuthenticatedProfile | null> {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError?.name === 'AuthSessionMissingError') return null
  if (userError) throw userError
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('category, currency, expenses, savings, income')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  return { userId: user.id, profile }
}

export function useUserProfile() {
  return useSWR<AuthenticatedProfile | null>(PROFILE_CACHE_KEY, fetchAuthenticatedProfile)
}
