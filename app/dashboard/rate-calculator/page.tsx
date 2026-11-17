'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, hourlyRates } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'

export default function RateCalculatorPage() {
  const router = useRouter()
  const { data: account, error, isLoading } = useUserProfile()
  const [targetIncome, setTargetIncome] = useState('')
  const [hours, setHours] = useState('')
  const initialized = useRef(false)

  useEffect(() => {
    if (isLoading || error) return
    if (!account) router.replace('/login')
    else if (!account.profile) router.replace('/onboarding')
  }, [account, error, isLoading, router])

  useEffect(() => {
    if (!account?.profile || initialized.current) return
    setTargetIncome(String(account.profile.income ?? ''))
    initialized.current = true
  }, [account?.profile])

  if (isLoading || (!error && (!account || !account.profile))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><p role="status" className="text-gray-400">Loading your profile…</p></main>
  }
  if (error || !account?.profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-white"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Please try again.</p><Link href="/dashboard" className="mt-5 inline-block text-[#D4AF37] hover:underline">Back to dashboard</Link></div></main>
  }

  const profile = account.profile
  const currency = profile.currency || 'NGN'
  const monthlyExpenses = Math.max(0, Number(profile.expenses) || 0)
  const monthlySavings = Math.max(0, Number(profile.savings) || 0)
  const incomeTarget = targetIncome.trim() === '' ? Number.NaN : Number(targetIncome)
  const billableHours = hours.trim() === '' ? Number.NaN : Number(hours)
  const rates = hourlyRates(monthlyExpenses, incomeTarget, billableHours)
  const normalizedTarget = Number.isFinite(incomeTarget) ? Math.max(0, incomeTarget) : 0

  return (
    <main className="min-h-screen w-full bg-[#050505] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#D4AF37]">← Back to dashboard</Link>
        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Rate Calculator</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">What should you charge?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Estimate an hourly rate from your monthly expenses, income target, and realistic billable hours.</p>
        </header>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <label htmlFor="monthly-target" className="block text-sm font-semibold text-gray-300">Monthly income target</label>
            <input id="monthly-target" type="number" min="0" step="0.01" required inputMode="decimal" value={targetIncome} onChange={(event) => setTargetIncome(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-white outline-none focus:border-[#D4AF37]" />
            <p className="mt-2 text-xs leading-5 text-gray-500">Prefilled from your saved average monthly income. This is treated as your desired gross monthly income, not take-home pay.</p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <label htmlFor="billable-hours" className="block text-sm font-semibold text-gray-300">Billable hours per month</label>
            <input id="billable-hours" type="number" min="1" max="744" step="1" required inputMode="numeric" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Example: 80" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-white outline-none focus:border-[#D4AF37]" />
            <p className="mt-2 text-xs leading-5 text-gray-500">Use only hours you realistically expect to invoice. Daily, weekly, and monthly equivalents are not assumed.</p>
          </div>
        </section>

        {normalizedTarget < monthlyExpenses && <p className="mt-4 rounded-lg border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-200">Your income target is below monthly expenses. The suggested rate uses expenses as the minimum monthly revenue floor.</p>}

        <section aria-live="polite" className="mt-6 grid gap-5 sm:grid-cols-2">
          <RateCard label="Minimum hourly rate" value={rates.minimum === null ? '—' : `${formatCurrency(rates.minimum, currency)} / hour`} description="Monthly expenses divided by monthly billable hours. This covers expenses before taxes and other business costs." />
          <RateCard label="Suggested hourly rate" value={rates.suggested === null ? '—' : `${formatCurrency(rates.suggested, currency)} / hour`} description="The higher of your monthly income target or expenses, divided by billable hours." highlighted />
        </section>
        {rates.suggested === null && <p className="mt-4 text-sm text-gray-500">Enter a valid monthly target and 1–744 billable hours to see your rates.</p>}

        <section className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Your saved profile</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <ProfileMetric label="Monthly expenses" value={formatCurrency(monthlyExpenses, currency)} />
            <ProfileMetric label="Current savings" value={formatCurrency(monthlySavings, currency)} />
            <ProfileMetric label="Average monthly income" value={formatCurrency(Number(profile.income) || 0, currency)} />
          </div>
          <p className="mt-5 text-xs leading-5 text-gray-500">Savings are shown as a financial buffer and are not added to the recurring monthly rate target.</p>
        </section>
      </div>
    </main>
  )
}

function RateCard({ label, value, description, highlighted = false }: { label: string; value: string; description: string; highlighted?: boolean }) {
  return <div className={`min-w-0 rounded-2xl border bg-[#0b0b0b] p-6 sm:p-8 ${highlighted ? 'border-[#D4AF37]/50' : 'border-[#2a2a2a]'}`}><p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">{label}</p><p className={`mt-4 break-words text-3xl font-bold sm:text-4xl ${highlighted ? 'text-[#D4AF37]' : 'text-white'}`}>{value}</p><p className="mt-4 text-sm leading-6 text-gray-400">{description}</p></div>
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 break-words font-semibold text-white">{value}</p></div>
}
