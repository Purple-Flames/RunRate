'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, monthlyBurn, runwayMonths } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'

export default function RunwayPage() {
  const router = useRouter()
  const { data: account, error, isLoading } = useUserProfile()

  useEffect(() => {
    if (isLoading || error) return
    if (!account) router.replace('/login')
    else if (!account.profile) router.replace('/onboarding')
  }, [account, error, isLoading, router])

  if (isLoading || (!error && (!account || !account.profile))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#241d2e]"><p role="status" className="text-gray-400">Loading your profile…</p></main>
  }
  if (error || !account?.profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-center text-[#241d2e]"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Please try again.</p><Link href="/dashboard" className="mt-5 inline-block text-[#6842A6] hover:underline">Back to dashboard</Link></div></main>
  }

  const profile = account.profile
  const savings = Math.max(0, Number(profile.savings) || 0)
  const expenses = Math.max(0, Number(profile.expenses) || 0)
  const income = Math.max(0, Number(profile.income) || 0)
  const burn = monthlyBurn(expenses, income)
  const runway = runwayMonths(savings, expenses, income)
  const incomeSurplus = Math.max(0, income - expenses)
  const currency = profile.currency || 'NGN'

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-5 py-8 text-[#241d2e] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#6842A6]">← Back to dashboard</Link>
        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#6842A6]">Financial Runway</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">How long can your savings support you?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Runway uses actual current income—not your desired target—to calculate monthly surplus, shortfall, and savings drawdown.</p>
        </header>

        <div className="mt-7 overflow-hidden rounded-2xl">
          <Image src="/runrate-planning.png" alt="A freelancer reviewing a financial plan at a bright desk" width={1200} height={675} sizes="(min-width: 1024px) 960px, 100vw" className="h-44 w-full object-cover sm:h-56" />
        </div>
        <section aria-label="Financial profile" className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Current savings" value={formatCurrency(savings, currency)} highlighted />
          <Metric label="Monthly expenses" value={formatCurrency(expenses, currency)} />
          <Metric label="Current average monthly income" value={formatCurrency(income, currency)} />
          <Metric label="Target monthly income" value={profile.target_monthly_income == null ? 'Not set' : formatCurrency(Number(profile.target_monthly_income), currency)} />
        </section>

        <section aria-live="polite" className="mt-6 rounded-2xl border border-[#6842A6]/40 bg-[#FFFFFF] p-6 sm:p-8">
          <p className="text-sm text-gray-400">Estimated runway</p>
          {runway === null ? (
            <p className="mt-3 text-3xl font-bold text-[#6842A6]">No monthly drawdown</p>
          ) : (
            <p className="mt-3 break-words text-4xl font-bold text-[#6842A6] sm:text-5xl">{runway.toFixed(1)} months</p>
          )}
          <p className="mt-4 text-sm leading-6 text-gray-400">{burn > 0 ? `Your monthly expenses are ${formatCurrency(burn, currency)} higher than your income. You would need to use about ${formatCurrency(burn, currency)} from savings each month to cover that shortfall. This estimate assumes income and expenses stay constant; it does not include taxes, irregular bills, or changes in client work.` : incomeSurplus > 0 ? `Your monthly income covers your expenses, leaving ${formatCurrency(incomeSurplus, currency)} each month. You are not currently drawing down your savings to meet these expenses. Savings remain available as a separate buffer for emergencies or unexpected costs.` : 'Your monthly income covers your expenses exactly, with no monthly surplus. You are not currently drawing down your savings to meet these expenses. Savings remain available as a separate buffer for emergencies or unexpected costs.'}</p>
        </section>
      </div>
    </main>
  )
}

function Metric({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return <div className="min-w-0 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6"><p className="text-sm text-gray-400">{label}</p><p className={`mt-3 break-words text-2xl font-bold ${highlighted ? 'text-[#6842A6]' : 'text-[#241d2e]'}`}>{value}</p></div>
}
