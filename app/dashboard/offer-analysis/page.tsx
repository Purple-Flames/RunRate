'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  currency: string
  expenses: number
  savings: number
  income: number
  category: string | string[]
}

type DurationUnit = 'days' | 'weeks' | 'months'

const MONTH_WEEKS = 4.345

export default function OfferAnalysisPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileError, setProfileError] = useState(false)
  const [category, setCategory] = useState('')
  const [offer, setOffer] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState('')
  const [duration, setDuration] = useState('')
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('weeks')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfileError(true)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('currency, expenses, savings, income, category')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !data) {
        setProfileError(true)
        return
      }

      const savedProfile = data as Profile
      setProfile(savedProfile)
      const categories = Array.isArray(savedProfile.category) ? savedProfile.category : [savedProfile.category]
      setCategory(categories[0] ?? '')
    }

    loadProfile()
  }, [])

  const categories = useMemo(() => {
    if (!profile) return []
    return (Array.isArray(profile.category) ? profile.category : [profile.category]).filter(Boolean)
  }, [profile])

  const analysis = useMemo(() => {
    const totalOffer = Math.max(0, Number(offer) || 0)
    const inputDuration = Math.max(0, Number(duration) || 0)
    const dailyHours = Math.max(0, Number(hoursPerDay) || 0)
    const weeklyDays = Math.max(0, Number(daysPerWeek) || 0)
    const months = durationUnit === 'days' ? inputDuration / 30.4375 : durationUnit === 'weeks' ? inputDuration / MONTH_WEEKS : inputDuration
    const weeks = months * MONTH_WEEKS
    const totalHours = weeks * weeklyDays * dailyHours
    const projectExpenses = Math.max(0, Number(profile?.expenses) || 0) * months
    const hourlyRate = totalHours > 0 ? totalOffer / totalHours : 0
    const breakEvenRate = totalHours > 0 ? projectExpenses / totalHours : 0
    const targetRate = weeklyDays * dailyHours > 0 ? (Number(profile?.income) || 0) / (MONTH_WEEKS * weeklyDays * dailyHours) : 0
    const minimumOffer = projectExpenses
    const targetOffer = Math.max(0, Number(profile?.income) || 0) * months
    const targetDifference = totalOffer - targetOffer
    const minimumDifference = totalOffer - minimumOffer
    const targetCoverage = targetOffer > 0 ? (totalOffer / targetOffer) * 100 : 0
    const remainingAfterExpenses = totalOffer - projectExpenses
    const monthlyEquivalent = months > 0 ? totalOffer / months : 0
    const currentRunway = Number(profile?.expenses) > 0 ? Number(profile?.savings || 0) / Number(profile?.expenses) : 0
    const runwayAfterOffer = Number(profile?.expenses) > 0 ? (Number(profile?.savings || 0) + remainingAfterExpenses) / Number(profile?.expenses) : 0
    const complete = totalOffer > 0 && inputDuration > 0 && dailyHours > 0 && weeklyDays > 0
    const status = !complete ? 'incomplete' : totalOffer < minimumOffer ? 'below-expenses' : totalOffer < targetOffer ? 'below-target' : totalOffer === targetOffer ? 'meets-target' : 'exceeds-target'

    return { totalOffer, inputDuration, dailyHours, weeklyDays, months, weeks, totalHours, projectExpenses, hourlyRate, breakEvenRate, targetRate, minimumOffer, targetOffer, targetDifference, minimumDifference, targetCoverage, remainingAfterExpenses, monthlyEquivalent, currentRunway, runwayAfterOffer, complete, status }
  }, [daysPerWeek, duration, durationUnit, hoursPerDay, offer, profile])

  if (profileError) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-center text-white"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-gray-400">We could not load your saved profile. Return to the dashboard and try again.</p><Link href="/dashboard" className="mt-6 inline-block text-[#D4AF37] hover:underline">Back to Dashboard</Link></div></main>
  }

  if (!profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><p className="text-gray-400">Loading your profile...</p></main>
  }

  const currency = profile.currency === 'NGN' ? '₦' : profile.currency === 'USD' ? '$' : profile.currency
  const format = (value: number) => `${currency}${Math.abs(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  const signedFormat = (value: number) => value < 0 ? `-${format(value)}` : format(value)
  const label = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value
  const statusText = analysis.status === 'below-expenses' ? 'This offer fails to cover the expenses allocated to the project period.' : analysis.status === 'below-target' ? 'This offer covers the project expenses, but falls below your income target.' : analysis.status === 'meets-target' ? 'This offer meets your saved average monthly income target.' : analysis.status === 'exceeds-target' ? 'This offer exceeds your saved income target.' : 'Complete the inputs to see your financial assessment.'
  const statusTone = analysis.status === 'below-expenses' ? 'text-red-300' : analysis.status === 'incomplete' ? 'text-gray-400' : 'text-[#D4AF37]'

  return (
    <main className="min-h-screen w-full bg-[#050505] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#D4AF37]">← Back to Dashboard</Link>
        <header className="mt-8"><p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Offer Analysis</p><h1 className="mt-3 text-3xl font-bold sm:text-4xl">Should you take this offer?</h1><p className="mt-3 max-w-3xl text-base leading-7 text-gray-400">Compare a client offer with your saved financial baseline, workload, and runway before you commit.</p></header>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Offer details</h2><p className="mt-1 text-sm text-gray-500">Your saved currency and profile figures are used automatically.</p>
            <div className="mt-6 grid gap-5">
              <label className="text-sm font-semibold text-gray-300">Freelancer category<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]">{categories.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
              <label className="text-sm font-semibold text-gray-300">Total client offer amount<input type="number" min="0" step="0.01" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="Example: 2500" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" /></label>
              <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-gray-300">Working hours per day<input type="number" min="0" step="0.5" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} placeholder="Example: 6" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" /></label><label className="text-sm font-semibold text-gray-300">Working days per week<input type="number" min="0" max="7" step="1" value={daysPerWeek} onChange={(e) => setDaysPerWeek(e.target.value)} placeholder="Example: 5" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" /></label></div>
              <div className="grid gap-5 sm:grid-cols-[1fr_1fr]"><label className="text-sm font-semibold text-gray-300">Project duration<input type="number" min="0" step="0.1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Example: 2" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" /></label><label className="text-sm font-semibold text-gray-300">Duration unit<select value={durationUnit} onChange={(e) => setDurationUnit(e.target.value as DurationUnit)} className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]"><option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option></select></label></div>
            </div>
          </div>
          <div className="rounded-2xl border border-[#D4AF37]/50 bg-[#0b0b0b] p-6 sm:p-8"><p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Financial assessment</p><p className={`mt-4 text-xl font-semibold leading-8 ${statusTone}`}>{statusText}</p><p className="mt-5 text-sm leading-6 text-gray-400">{analysis.complete ? `At ${analysis.dailyHours} hours per day and ${analysis.weeklyDays} days per week, this project is estimated at ${analysis.totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hours. The offer works out to ${format(analysis.hourlyRate)} per hour.` : 'Enter a positive offer, duration, and workload to calculate the assessment.'}</p></div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[['Estimated project hours', analysis.totalHours > 0 ? `${analysis.totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hours` : '—'], ['Effective hourly rate', analysis.complete ? `${format(analysis.hourlyRate)} / hour` : '—'], ['Break-even hourly rate', analysis.complete ? `${format(analysis.breakEvenRate)} / hour` : '—'], ['Target hourly rate', analysis.complete ? `${format(analysis.targetRate)} / hour` : '—'], ['Minimum viable offer', analysis.complete ? format(analysis.minimumOffer) : '—'], ['Target offer', analysis.complete ? format(analysis.targetOffer) : '—'], ['Target covered', analysis.complete ? `${Math.max(0, analysis.targetCoverage).toFixed(1)}%` : '—'], ['After project expenses', analysis.complete ? signedFormat(analysis.remainingAfterExpenses) : '—'], ['Monthly equivalent', analysis.complete ? format(analysis.monthlyEquivalent) : '—']].map(([title, value]) => <div key={title} className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6"><p className="text-sm text-gray-400">{title}</p><p className="mt-3 break-words text-2xl font-bold text-[#D4AF37]">{value}</p></div>)}
        </section>

        <section className="mt-6 rounded-2xl border border-[#D4AF37]/60 bg-[#0b0b0b] p-6 sm:p-8"><h2 className="text-2xl font-bold text-[#D4AF37]">What Would Make This Offer Worthwhile?</h2><p className="mt-3 text-sm leading-6 text-gray-400">These benchmarks use your saved monthly expenses and average monthly income, allocated across the selected project period.</p><div className="mt-6 grid gap-4 md:grid-cols-3"><div className="rounded-xl border border-[#333] p-5"><p className="text-sm text-gray-400">Client&apos;s offer</p><p className="mt-2 text-2xl font-bold">{analysis.complete ? format(analysis.totalOffer) : '—'}</p></div><div className="rounded-xl border border-[#333] p-5"><p className="text-sm text-gray-400">Minimum viable offer</p><p className="mt-2 text-2xl font-bold">{analysis.complete ? format(analysis.minimumOffer) : '—'}</p><p className="mt-2 text-sm text-gray-400">Difference: {analysis.complete ? signedFormat(analysis.minimumDifference) : '—'}</p></div><div className="rounded-xl border border-[#333] p-5"><p className="text-sm text-gray-400">Target offer</p><p className="mt-2 text-2xl font-bold">{analysis.complete ? format(analysis.targetOffer) : '—'}</p><p className="mt-2 text-sm text-gray-400">Difference: {analysis.complete ? signedFormat(analysis.targetDifference) : '—'}</p></div></div><p className="mt-6 text-base leading-7 text-gray-300">{!analysis.complete ? 'Use the workload and duration fields above to get practical guidance.' : analysis.status === 'below-expenses' ? `The offer is ${format(Math.abs(analysis.minimumDifference))} below the minimum needed to cover project-period expenses. You would need to negotiate at least ${format(analysis.minimumOffer)} or reduce the workload or project period.` : analysis.status === 'below-target' ? `The offer covers project expenses, but is ${format(Math.abs(analysis.targetDifference))} below your target. It may be financially workable for a short-term need, but accepting it at this workload would not match your saved income goal.` : analysis.status === 'meets-target' ? 'The offer covers the allocated project expenses and matches your saved income target. Confirm the schedule is realistic before committing.' : `The offer is ${format(analysis.targetDifference)} above your saved target and covers the project expenses. Consider whether the additional value justifies the workload and delivery risk.`}</p></section>

        <section className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:p-8"><h2 className="text-xl font-bold">Runway effect, separate from profitability</h2><p className="mt-3 text-sm leading-7 text-gray-400">Project profitability compares the offer with expenses allocated to this project. Runway estimates how long your saved savings could cover monthly expenses. If the offer is paid and the remaining amount is added to savings, your estimated runway changes from <strong className="text-white">{analysis.currentRunway.toFixed(1)} months</strong> to <strong className="text-white">{analysis.complete ? analysis.runwayAfterOffer.toFixed(1) : '—'} months</strong>. This is an estimate, not a guarantee: payment timing, taxes, other costs, and unpaid work are not included.</p><p className="mt-4 text-sm leading-7 text-gray-500">Assumption: 1 month equals {MONTH_WEEKS} weeks or 30.4375 days. Expenses and income are allocated proportionally to the project duration.</p></section>
      </div>
    </main>
  )
}
