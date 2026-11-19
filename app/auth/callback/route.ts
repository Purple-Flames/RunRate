import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const safeNext = next === '/dashboard' || next === '/onboarding' || next === '/dashboard/settings' || next === '/reset-password' ? next : null
  const oauthError = requestUrl.searchParams.get('error')
  const cookieStore = await cookies()

  if (oauthError) {
    const cancelled = oauthError === 'access_denied' || oauthError === 'user_cancelled'
    const destination = safeNext === '/dashboard/settings'
      ? `/dashboard/settings?google_link=${cancelled ? 'cancelled' : 'failed'}`
      : '/login?error=google_oauth_cancelled'
    return NextResponse.redirect(new URL(destination, requestUrl))
  }

  if (!code) {
    return NextResponse.redirect(new URL(safeNext === '/dashboard/settings' ? '/dashboard/settings?google_link=failed' : '/login?error=missing_auth_code', requestUrl))
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    const destination = safeNext === '/dashboard/settings' ? '/dashboard/settings?google_link=failed' : '/login?error=auth_callback_failed'
    return NextResponse.redirect(new URL(destination, requestUrl))
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=missing_session', requestUrl))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  return NextResponse.redirect(new URL(safeNext ?? (profile ? '/dashboard' : '/onboarding'), requestUrl))
}
