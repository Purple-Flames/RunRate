'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, hourlyRates } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'
import { runrateImages } from '@/lib/images'

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
    setTargetIncome(account.profile.target_monthly_income == null ? '' : String(account.profile.target_monthly_income))
    initialized.current = true
  }, [account?.profile])

  if (isLoading || (!error && (!account || !account.profile))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#241d2e]"><p role="status" className="text-gray-400">Loading your profile…</p></main>
  }
  if (error || !account?.profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-center text-[#241d2e]"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Please try again.</p><Link href="/dashboard" className="mt-5 inline-block text-[#6842A6] hover:underline">Back to dashboard</Link></div></main>
  }

  const profile = account.profile
  const currency = profile.currency || 'NGN'
  const monthlyExpenses = Math.max(0, Number(profile.expenses) || 0)
  const monthlySavings = Math.max(0, Number(profile.savings) || 0)
  const targetMissing = profile.target_monthly_income == null
  const incomeTarget = targetMissing ? null : targetIncome.trim() === '' ? Number.NaN : Number(targetIncome)
  const billableHours = hours.trim() === '' ? Number.NaN : Number(hours)
  const rates = hourlyRates(monthlyExpenses, incomeTarget, billableHours)
  const normalizedTarget = incomeTarget !== null && Number.isFinite(incomeTarget) ? Math.max(0, incomeTarget) : 0

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] px-5 py-8 text-[#241d2e] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#6842A6]">← Back to dashboard</Link>
        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#6842A6]">Rate Calculator</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">What should you charge?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Estimate an hourly rate from your monthly expenses, income target, and realistic billable hours.</p>
        </header>

        <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#E8E3ED] bg-[#F7F5FA] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-[4/3] md:min-h-[320px]">
            <Image src={runrateImages.phoneDecision} alt="Black African man thoughtfully reviewing his phone in a warmly lit library" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[center_38%]" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6842A6]">Price with intention</p>
            <p className="mt-3 text-2xl leading-tight sm:text-3xl">Set a rate that supports your goals.</p>
            <p className="mt-3 text-sm leading-6 text-[#625b6b]">Compare a realistic billable schedule with your monthly expenses and separate income target.</p>
          </div>
        </div>
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6">
            <label htmlFor="monthly-target" className="block text-sm font-semibold text-gray-300">Target Monthly Income ({currency})</label>
            <input id="monthly-target" type="number" min="0" step="0.01" required inputMode="decimal" value={targetIncome} onChange={(event) => setTargetIncome(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6FA] px-4 text-[#241d2e] outline-none focus:border-[#6842A6]" />
            <p className="mt-2 text-xs leading-5 text-gray-500">This is your desired gross monthly income goal, not take-home pay or income you currently receive. It is independent of Current Average Monthly Income.</p>
          </div>
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6">
            <label htmlFor="billable-hours" className="block text-sm font-semibold text-gray-300">Billable hours per month</label>
            <input id="billable-hours" type="number" min="1" max="744" step="1" required inputMode="numeric" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Example: 80" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6FA] px-4 text-[#241d2e] outline-none focus:border-[#6842A6]" />
            <p className="mt-2 text-xs leading-5 text-gray-500">Use only hours you realistically expect to invoice. Daily, weekly, and monthly equivalents are not assumed.</p>
          </div>
        </section>

        {targetMissing && <p role="status" className="mt-4 rounded-lg border border-[#6842A6]/50 bg-[#F7F5FA] p-4 text-sm leading-6 text-gray-200">Your Target Monthly Income is not set. Add it in <Link href="/onboarding" className="font-semibold text-[#6842A6] underline">Edit Profile</Link> before using a target-based suggested rate. The minimum hourly rate below still uses monthly expenses and billable hours.</p>}
        {!targetMissing && normalizedTarget < monthlyExpenses && <p className="mt-4 rounded-lg border border-amber-900 bg-amber-950/30 p-4 text-sm text-amber-200">Your target is below monthly expenses. The suggested rate uses expenses as the minimum monthly revenue floor.</p>}

        <section aria-live="polite" className="mt-6 grid gap-5 sm:grid-cols-2">
          <RateCard label="Minimum hourly rate" value={rates.minimum === null ? '—' : `${formatCurrency(rates.minimum, currency)} / hour`} description="Monthly expenses divided by monthly billable hours. This covers expenses before taxes and other business costs." />
          <RateCard label="Suggested hourly rate" value={rates.suggested === null ? '—' : `${formatCurrency(rates.suggested, currency)} / hour`} description="The higher of your monthly income target or expenses, divided by billable hours." highlighted />
        </section>
        {rates.suggested === null && !targetMissing && <p className="mt-4 text-sm text-gray-500">Enter a valid target and 1–744 billable hours to see the suggested rate.</p>}

        <section className="mt-6 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#6842A6]">Your saved profile</p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ProfileMetric label="Monthly expenses" value={formatCurrency(monthlyExpenses, currency)} />
            <ProfileMetric label="Current savings" value={formatCurrency(monthlySavings, currency)} />
            <ProfileMetric label="Current average monthly income" value={formatCurrency(Number(profile.income) || 0, currency)} />
            <ProfileMetric label="Target monthly income" value={profile.target_monthly_income == null ? 'Not set' : formatCurrency(Number(profile.target_monthly_income), currency)} />
          </div>
          <p className="mt-5 text-xs leading-5 text-gray-500">Savings are shown as a financial buffer and are not added to the recurring monthly rate target.</p>
        </section>
      </div>
    </main>
  )
}

function RateCard({ label, value, description, highlighted = false }: { label: string; value: string; description: string; highlighted?: boolean }) {
  return <div className={`min-w-0 rounded-2xl border bg-[#FFFFFF] p-6 sm:p-8 ${highlighted ? 'border-[#6842A6]/50' : 'border-[#E8E3ED]'}`}><p className="text-sm font-semibold uppercase tracking-[0.15em] text-gray-400">{label}</p><p className={`mt-4 break-words text-3xl font-bold sm:text-4xl ${highlighted ? 'text-[#6842A6]' : 'text-[#241d2e]'}`}>{value}</p><p className="mt-4 text-sm leading-6 text-gray-400">{description}</p></div>
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-sm text-gray-500">{label}</p><p className="mt-2 break-words font-semibold text-[#241d2e]">{value}</p></div>
}
