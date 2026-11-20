'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCurrency, monthlyBurn, runwayMonths } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'
import { runrateImages } from '@/lib/images'

export default function RunwayPage() {
  const router = useRouter()
  const { data: account, error, isLoading } = useUserProfile()
  const [simulation, setSimulation] = useState<{ income: number; expenses: number; savings: number } | null>(null)

  useEffect(() => {
    if (isLoading || error) return
    if (!account) router.replace('/login')
    else if (!account.profile) router.replace('/onboarding')
  }, [account, error, isLoading, router])

  if (isLoading || (!error && (!account || !account.profile))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#29252A]"><p role="status" className="text-gray-400">Loading your profile…</p></main>
  }
  if (error || !account?.profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-center text-[#29252A]"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Please try again.</p><Link href="/dashboard" className="mt-5 inline-block text-[#54264F] hover:underline">Back to dashboard</Link></div></main>
  }

  const profile = account.profile
  const savings = Math.max(0, Number(profile.savings) || 0)
  const expenses = Math.max(0, Number(profile.expenses) || 0)
  const income = Math.max(0, Number(profile.income) || 0)
  const burn = monthlyBurn(expenses, income)
  const runway = runwayMonths(savings, expenses, income)
  const incomeSurplus = Math.max(0, income - expenses)
  const currency = profile.currency || 'NGN'
  const simulatedIncome = simulation?.income ?? income
  const simulatedExpenses = simulation?.expenses ?? expenses
  const simulatedSavings = simulation?.savings ?? savings
  const simulatedBurn = monthlyBurn(simulatedExpenses, simulatedIncome)
  const simulatedRunway = runwayMonths(simulatedSavings, simulatedExpenses, simulatedIncome)
  const monthlyChange = simulatedIncome - simulatedExpenses
  const projection = Array.from({ length: 13 }, (_, month) => Math.max(0, simulatedSavings + monthlyChange * month))
  const projectionPoints = projection.map((balance, index) => `${40 + index * 50},${205 - (balance / Math.max(1, ...projection)) * 175}`).join(' ')
  const maxExpense = Math.max(expenses * 2, 1000)
  const maxIncome = Math.max(income * 2, 1000)
  const maxSavings = Math.max(savings * 2, 1000)

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-5 py-8 text-[#29252A] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#54264F]">← Back to dashboard</Link>
        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#54264F]">Financial Runway</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">How long can your savings support you?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Runway uses actual current income—not your desired target—to calculate monthly surplus, shortfall, and savings drawdown.</p>
        </header>

        <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#E8E3ED] bg-[#F4F0F6] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-[4/3] md:min-h-[320px]">
            <Image src={runrateImages.journaling} alt="Black African woman thoughtfully writing in her journal at a library table" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[center_38%]" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#54264F]">Reflect, then plan</p>
            <p className="mt-3 text-2xl leading-tight sm:text-3xl">A thoughtful view of your financial runway.</p>
            <p className="mt-3 text-sm leading-6 text-[#625b6b]">Use your current income, expenses, and savings to understand the pace you&apos;re working at today.</p>
          </div>
        </div>
        <section aria-label="Financial profile" className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Current savings" value={formatCurrency(savings, currency)} highlighted />
          <Metric label="Monthly expenses" value={formatCurrency(expenses, currency)} />
          <Metric label="Current average monthly income" value={formatCurrency(income, currency)} />
          <Metric label="Target monthly income" value={profile.target_monthly_income == null ? 'Not set' : formatCurrency(Number(profile.target_monthly_income), currency)} />
        </section>

        <section className="mt-8 rounded-3xl border border-[#E9E3E9] bg-white p-5 shadow-sm sm:p-8" aria-labelledby="simulator-title">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#54264F]">Runway studio · What if?</p><h2 id="simulator-title" className="mt-2 text-3xl sm:text-4xl">Try a different month.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Adjust a temporary scenario to see how income, expenses, and savings could shape your cash buffer. Nothing here changes your saved profile.</p></div>
            <button type="button" onClick={() => setSimulation(null)} className="min-h-11 self-start rounded-full border border-[#E9E3E9] px-4 text-sm font-semibold text-[#54264F] hover:bg-[#F4F0F6] sm:self-auto">Reset to saved figures</button>
          </div>
          <div className="mt-7 grid gap-7 lg:grid-cols-[.85fr_1.15fr]">
            <div className="grid content-start gap-5">
              <SimulatorInput label="Current monthly income" value={simulatedIncome} max={maxIncome} currency={currency} onChange={(value) => setSimulation({ income: value, expenses: simulatedExpenses, savings: simulatedSavings })} />
              <SimulatorInput label="Monthly expenses" value={simulatedExpenses} max={maxExpense} currency={currency} onChange={(value) => setSimulation({ income: simulatedIncome, expenses: value, savings: simulatedSavings })} />
              <SimulatorInput label="Current savings" value={simulatedSavings} max={maxSavings} currency={currency} onChange={(value) => setSimulation({ income: simulatedIncome, expenses: simulatedExpenses, savings: value })} />
            </div>
            <div className="rounded-2xl bg-[#F8F6F3] p-5 sm:p-7" aria-live="polite">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-gray-500">Simulated runway</p><p className="mt-1 text-4xl font-semibold text-[#54264F]">{simulatedRunway === null ? 'No drawdown' : `${simulatedRunway.toFixed(1)} months`}</p></div><p className={`rounded-full px-3 py-2 text-xs font-semibold ${monthlyChange > 0 ? 'bg-[#E9DFF0] text-[#54264F]' : monthlyChange < 0 ? 'bg-white text-[#72505C]' : 'bg-white text-[#6f6878]'}`}>{monthlyChange > 0 ? `${formatCurrency(monthlyChange, currency)} monthly surplus` : monthlyChange < 0 ? `${formatCurrency(simulatedBurn, currency)} monthly deficit` : 'Income matches expenses'}</p></div>
              <div className="mt-5 overflow-hidden rounded-xl border border-[#E9E3E9] bg-white p-3 sm:p-4"><svg viewBox="0 0 680 230" className="h-48 w-full" role="img" aria-label="Twelve-month projection of simulated savings balance"><line x1="40" y1="205" x2="640" y2="205" stroke="#E9E3E9" strokeWidth="2" /><polyline points={projectionPoints} fill="none" stroke="#54264F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="900" className="projection-line" key={projectionPoints} />{projection.filter((_, index) => index % 3 === 0).map((balance, index) => <circle key={index} cx={40 + index * 150} cy={205 - (balance / Math.max(1, ...projection)) * 175} r="5" fill="#54264F" />)}</svg><div className="flex justify-between px-1 text-xs text-gray-500"><span>Today</span><span>3 mo</span><span>6 mo</span><span>9 mo</span><span>12 mo</span></div></div>
              <p className="mt-4 text-xs leading-5 text-gray-500">Projection assumes income and expenses remain constant and that any monthly surplus is added to savings. A deficit draws savings down to zero. Taxes, irregular bills, and future work are not included.</p>
            </div>
          </div>
        </section>

        <section aria-live="polite" className="mt-6 rounded-2xl border border-[#54264F]/40 bg-[#FFFFFF] p-6 sm:p-8">
          <p className="text-sm text-gray-400">Estimated runway</p>
          {runway === null ? (
            <p className="mt-3 text-3xl font-bold text-[#54264F]">No monthly drawdown</p>
          ) : (
            <p className="mt-3 break-words text-4xl font-bold text-[#54264F] sm:text-5xl">{runway.toFixed(1)} months</p>
          )}
          <p className="mt-4 text-sm leading-6 text-gray-400">{burn > 0 ? `Your monthly expenses are ${formatCurrency(burn, currency)} higher than your income. You would need to use about ${formatCurrency(burn, currency)} from savings each month to cover that shortfall. This estimate assumes income and expenses stay constant; it does not include taxes, irregular bills, or changes in client work.` : incomeSurplus > 0 ? `Your monthly income covers your expenses, leaving ${formatCurrency(incomeSurplus, currency)} each month. You are not currently drawing down your savings to meet these expenses. Savings remain available as a separate buffer for emergencies or unexpected costs.` : 'Your monthly income covers your expenses exactly, with no monthly surplus. You are not currently drawing down your savings to meet these expenses. Savings remain available as a separate buffer for emergencies or unexpected costs.'}</p>
        </section>
      </div>
    </main>
  )
}

function SimulatorInput({ label, value, max, currency, onChange }: { label: string; value: number; max: number; currency: string; onChange: (value: number) => void }) {
  const inputId = `simulation-${label.toLowerCase().replaceAll(' ', '-')}`
  return (
    <div>
      <div className="flex items-center justify-between gap-3"><label htmlFor={inputId} className="text-sm font-semibold">{label}</label><span className="text-sm font-semibold text-[#54264F]">{formatCurrency(value, currency)}</span></div>
      <input id={inputId} type="range" min="0" max={max} step={Math.max(1, Math.round(max / 100))} value={Math.min(value, max)} onChange={(event) => onChange(Number(event.target.value))} className="mt-3 w-full accent-[#54264F]" aria-valuetext={formatCurrency(value, currency)} />
      <div className="mt-2 flex items-center gap-2"><label htmlFor={`${inputId}-amount`} className="text-xs text-gray-500">Or enter amount</label><span aria-hidden="true" className="text-sm text-gray-500">{currency === 'USD' ? '$' : '₦'}</span><input id={`${inputId}-amount`} type="number" min="0" step="0.01" inputMode="decimal" value={value} onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))} className="min-h-10 w-36 rounded-lg border border-[#E9E3E9] bg-white px-3 text-sm" /></div>
    </div>
  )
}

function Metric({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
  return <div className="min-w-0 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6"><p className="text-sm text-gray-400">{label}</p><p className={`mt-3 break-words text-2xl font-bold ${highlighted ? 'text-[#54264F]' : 'text-[#29252A]'}`}>{value}</p></div>
}
