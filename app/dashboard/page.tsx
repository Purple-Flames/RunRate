'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, monthlyBurn, runwayMonths } from '@/lib/finance'
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
      <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-[#29252A]">
        <p role="status" className="text-base text-gray-400">Loading your dashboard...</p>
      </main>
    )
  }

  if (error || !account?.profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-[#29252A]">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-gray-400">We couldn&apos;t load your profile. Please refresh the page or sign in again.</p>
          <Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[#54264F] px-4 text-sm font-semibold text-[#54264F]">Sign in</Link>
        </div>
      </main>
    )
  }

  const profile = account.profile
  const currency = profile.currency || 'NGN'
  const categories = Array.isArray(profile.category) ? profile.category : profile.category ? [profile.category] : []
  const categoryDisplay = categories.map((item) => item.charAt(0).toUpperCase() + item.slice(1)).join(' · ') || 'Category not set'
  const currentIncome = Math.max(0, Number(profile.income) || 0)
  const monthlyExpenses = Math.max(0, Number(profile.expenses) || 0)
  const currentSavings = Math.max(0, Number(profile.savings) || 0)
  const monthlySurplus = currentIncome - monthlyExpenses
  const burn = monthlyBurn(monthlyExpenses, currentIncome)
  const runway = runwayMonths(currentSavings, monthlyExpenses, currentIncome)
  const target = profile.target_monthly_income == null ? null : Math.max(0, Number(profile.target_monthly_income) || 0)
  const nextAction = target === null
    ? { title: 'Set your income target', body: 'Add a separate monthly goal to unlock target-based rate and offer comparisons.', href: '/onboarding', action: 'Edit financial profile' }
    : runway !== null && runway < 3
      ? { title: 'Explore your runway scenarios', body: 'Try a temporary income or expense change and see how it affects your savings buffer.', href: '/dashboard/runway', action: 'Open runway studio' }
      : { title: 'Review your pricing baseline', body: 'Compare your billable hours with the rate your income goal calls for.', href: '/dashboard/rate-calculator', action: 'Open rate calculator' }
  const financialInsight = monthlySurplus > 0
    ? `Your current income is above monthly expenses by ${formatCurrency(monthlySurplus, currency)}. Your target remains a separate goal.`
    : monthlySurplus < 0
      ? `Your current income is below monthly expenses by ${formatCurrency(burn, currency)} each month${runway === null ? '.' : `, with about ${runway.toFixed(1)} months of savings runway at this pace.`}`
      : 'Your current income matches monthly expenses, so savings are not growing or being drawn down from this monthly position.'

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] text-[#29252A]">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-[#222] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#54264F]">RunRate</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard</h1>
            <p className="mt-2 text-base text-gray-400">Your freelancer profile and financial starting point.</p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
            <div className="max-w-full break-words rounded-full border border-[#333] px-4 py-2 text-sm text-gray-300">{categoryDisplay}</div>
            <nav aria-label="Account navigation" className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/dashboard/settings" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#54264F] px-4 py-2 text-sm font-semibold text-[#54264F] transition-colors hover:bg-[#54264F] hover:text-white">Account Settings</Link>
              <Link href="/onboarding" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#333] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#54264F] hover:text-[#54264F]">Edit Profile</Link>
              <LogoutButton />
            </nav>
          </div>
        </header>

        {profile.target_monthly_income == null && <p role="status" className="mt-6 rounded-xl border border-[#54264F]/50 bg-[#F4F0F6] p-4 text-sm leading-6 text-gray-200">Add your Target Monthly Income in <Link href="/onboarding" className="font-semibold text-[#54264F] underline">Edit Profile</Link> to use target-based rate and offer calculations. Your current income and runway remain available.</p>}

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.25fr_.75fr]" aria-label="Financial overview">
          <article className="rounded-3xl border border-[#E9E3E9] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#54264F]">Your financial pulse</p>
            <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="relative mx-auto size-40 shrink-0 sm:mx-0"><svg viewBox="0 0 100 100" className="size-full -rotate-90" role="img" aria-label={runway === null ? 'No monthly savings drawdown at current income and expenses' : `${runway.toFixed(1)} months of runway, shown on a twelve-month scale`}><circle cx="50" cy="50" r="42" fill="none" stroke="#E9DFF0" strokeWidth="8" /><circle cx="50" cy="50" r="42" fill="none" stroke="#54264F" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${runway === null ? 0 : Math.min(1, runway / 12) * 264} 264`} className="pulse-ring" /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-semibold text-[#54264F]">{runway === null ? '—' : runway.toFixed(1)}</span><span className="text-xs text-gray-500">{runway === null ? 'no drawdown' : 'months'}</span></div></div>
              <div><h2 className="text-3xl sm:text-4xl">A clear view of today.</h2><p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">{financialInsight}</p><p className="mt-3 text-xs leading-5 text-gray-500">Runway is based on current average monthly income, expenses, and savings—not your target income. A 12-month ring is capped at one year for scale.</p><Link href="/dashboard/runway" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#54264F] px-5 text-sm font-semibold text-white hover:bg-[#421E3E]">Explore your runway <span className="ml-2" aria-hidden="true">→</span></Link></div>
            </div>
          </article>
          <article className="flex flex-col justify-between rounded-3xl bg-[#E9DFF0] p-6 sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#54264F]">Your next move</p><h2 className="mt-4 text-3xl">{nextAction.title}</h2><p className="mt-3 text-sm leading-7 text-[#574f60]">{nextAction.body}</p></div><Link href={nextAction.href} className="mt-7 inline-flex min-h-11 w-fit items-center rounded-full border border-[#54264F]/30 bg-white px-5 text-sm font-semibold text-[#54264F] hover:bg-[#F8F6F3]">{nextAction.action}<span className="ml-2" aria-hidden="true">→</span></Link></article>
        </section>

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
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#54264F]">RunRate Tools</p>
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
    <div className="min-w-0 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-3 break-words text-xl font-semibold ${highlighted ? 'text-[#54264F]' : 'text-[#29252A]'}`}>{value}</p>
    </div>
  )
}

function ToolCard({ number, href, title, description }: { number: string; href: string; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6">
      <p className="text-sm font-semibold text-[#54264F]">{number}</p>
      <Link href={href} className="block"><h3 className="mt-3 text-xl font-bold transition-colors hover:text-[#54264F]">{title}</h3></Link>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  )
}
