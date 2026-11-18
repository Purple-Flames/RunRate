'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'
import LogoutButton from './LogoutButton'

export default function DashboardPage() {
  const router = useRouter()
  const { data: account, error, isLoading } = useUserProfile()

  useEffect(() => {
    if (isLoading || error) return
    if (!account) router.replace('/login')
    else if (!account.profile) router.replace('/onboarding')
  }, [account, error, isLoading, router])

  if (isLoading || (!error && (!account || !account.profile))) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <p role="status" className="text-base text-gray-400">Loading your dashboard...</p>
      </main>
    )
  }

  if (error || !account?.profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">We couldn&apos;t load your profile. Please refresh the page or sign in again.</p>
          <Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[#D4AF37] px-4 text-sm font-semibold text-[#D4AF37]">Sign in</Link>
        </div>
      </main>
    )
  }

  const profile = account.profile
  const currency = profile.currency || 'NGN'
  const categories = Array.isArray(profile.category) ? profile.category : profile.category ? [profile.category] : []
  const categoryDisplay = categories.map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(' · ') || 'Category not set'

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-[#222] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">RunRate</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-base text-gray-400">Your freelancer profile and financial starting point.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <div className="max-w-full break-words rounded-full border border-[#333] px-4 py-2 text-sm text-gray-300">{categoryDisplay}</div>
            <nav aria-label="Account navigation" className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/dashboard/settings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#D4AF37] px-4 py-2 text-sm font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37] hover:text-black">Account Settings</Link>
              <Link href="/onboarding" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#333] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#D4AF37] hover:text-[#D4AF37]">Edit Profile</Link>
              <LogoutButton />
            </nav>
          </div>
        </header>

        {profile.target_monthly_income == null && <p role="status" className="mt-6 rounded-xl border border-[#D4AF37]/50 bg-[#11100b] p-4 text-sm leading-6 text-gray-200">Add your Target Monthly Income in <Link href="/onboarding" className="font-semibold text-[#D4AF37] underline">Edit Profile</Link> to use target-based rate and offer calculations. Your current income and runway remain available.</p>}

        <section className="py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl">Your profile</h2>
            <p className="mt-2 text-base text-gray-400">This is the information you saved during setup.</p>
          </div>

          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileCard label="Freelancer Category" value={categoryDisplay} />
            <ProfileCard label="Currency" value={currency} highlighted />
            <ProfileCard label="Monthly Expenses" value={formatCurrency(Number(profile.expenses), currency)} />
            <ProfileCard label="Current Savings" value={formatCurrency(Number(profile.savings), currency)} />
            <ProfileCard label="Current Average Monthly Income" value={formatCurrency(Number(profile.income), currency)} highlighted />
            <ProfileCard label="Target Monthly Income" value={profile.target_monthly_income == null ? 'Not set' : formatCurrency(Number(profile.target_monthly_income), currency)} />
          </div>
        </section>

        <section className="border-t border-[#222] py-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">RunRate Tools</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Your financial workspace</h2>
            <p className="mt-2 text-base text-gray-400">Use your profile as the starting point for smarter freelance pricing decisions.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <ToolCard number="01" href="/dashboard/runway" title="Financial Runway" description="Understand how your savings, income, and monthly expenses support your freelance work." />
            <ToolCard number="02" href="/dashboard/rate-calculator" title="Rate Calculator" description="Work out pricing that reflects your monthly expenses and income target." />
            <ToolCard number="03" href="/dashboard/offer-analysis" title="Offer Analysis" description="Evaluate freelance jobs and offers before deciding what to accept." />
          </div>
        </section>
      </div>
    </main>
  )
}

function ProfileCard({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-3 break-words text-xl font-semibold ${highlighted ? 'text-[#D4AF37]' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function ToolCard({ number, href, title, description }: { number: string; href: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
      <p className="text-sm font-semibold text-[#D4AF37]">{number}</p>
      <Link href={href} className="block"><h3 className="mt-3 text-xl font-bold transition-colors hover:text-[#D4AF37]">{title}</h3></Link>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  )
}
