'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { analyzeOffer, formatCurrency, type DurationUnit } from '@/lib/finance'
import { useUserProfile } from '@/lib/supabase/use-profile'
import { runrateImages } from '@/lib/images'

function numericInput(value: string) {
  return value.trim() === '' ? Number.NaN : Number(value)
}

const availableCategories = [
  'Designer', 'Developer', 'Writer', 'Marketer', 'Consultant', 'Accountant', 'Animator',
  'Copywriter', 'Data Analyst', 'Photographer', 'Project Manager', 'SEO Specialist',
  'Social Media Manager', 'Translator', 'Virtual Assistant', 'Videographer',
]

export default function OfferAnalysisPage() {
  const router = useRouter()
  const { data: account, error: profileError, isLoading } = useUserProfile()
  const [category, setCategory] = useState<string | null>(null)
  const [offer, setOffer] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState('')
  const [daysPerWeek, setDaysPerWeek] = useState('')
  const [duration, setDuration] = useState('')
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('weeks')
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    if (isLoading || profileError) return
    if (!account) router.replace('/login')
    else if (!account.profile) router.replace('/onboarding')
  }, [account, isLoading, profileError, router])

  const categories = useMemo(() => {
    const profileCategory = account?.profile?.category
    const saved = (Array.isArray(profileCategory) ? profileCategory : profileCategory ? [profileCategory] : []).filter(Boolean)
    return [...new Set([...saved, ...availableCategories])]
  }, [account?.profile?.category])


  if (isLoading || (!profileError && (!account || !account.profile))) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#29252A]"><p role="status" className="text-gray-400">Loading your profile…</p></main>
  }
  if (profileError || !account?.profile) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-center text-[#29252A]"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Return to the dashboard and try again.</p><Link href="/dashboard" className="mt-5 inline-block text-[#54264F] hover:underline">Back to dashboard</Link></div></main>
  }

  const profile = account.profile
  const savedCategory = Array.isArray(profile.category) ? profile.category[0] ?? '' : profile.category ?? ''
  const selectedCategory = category ?? (savedCategory || categories[0] || '')
  const currency = profile.currency || 'NGN'
  const monthlyExpenses = Math.max(0, Number(profile.expenses) || 0)
  const monthlyIncomeCurrent = Math.max(0, Number(profile.income) || 0)
  const monthlyIncomeTarget = profile.target_monthly_income == null ? null : Math.max(0, Number(profile.target_monthly_income) || 0)
  const savings = Math.max(0, Number(profile.savings) || 0)
  const targetMissing = monthlyIncomeTarget === null
  const analysis = analyzeOffer({
    offer: numericInput(offer),
    duration: numericInput(duration),
    durationUnit,
    hoursPerDay: numericInput(hoursPerDay),
    daysPerWeek: numericInput(daysPerWeek),
    monthlyExpenses,
    monthlyIncomeCurrent,
    monthlyIncomeTarget,
    savings,
  })
  const categoryLabel = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value
  const money = (value: number) => formatCurrency(value, currency)
  const signedMoney = (value: number) => value < 0 ? `-${money(value)}` : money(value)
  const runwayLabel = (value: number | null) => value === null ? 'Income covers monthly expenses; savings are not being drawn down' : `${value.toFixed(1)} months`
  const monthlyPositionText = analysis.monthlyBurn > 0
    ? `Your current average monthly income is ${money(analysis.monthlyBurn)} below expenses, so you would need to use savings to cover that amount each month.`
    : monthlyIncomeCurrent > monthlyExpenses
      ? `Your current average monthly income covers expenses with ${money(monthlyIncomeCurrent - monthlyExpenses)} left each month. Savings are not needed for these expenses and remain available for emergencies.`
      : 'Your current average monthly income covers expenses exactly, with no surplus. Savings are not needed for these expenses and remain available for emergencies.'
  const statusText = targetMissing
    ? 'Set a Target Monthly Income in your profile before comparing this offer to your income goal.'
    : analysis.status === 'below-expenses'
      ? 'This offer does not cover the expenses allocated to the project period.'
    : analysis.status === 'below-target'
      ? 'This offer covers allocated expenses but falls below your saved monthly income target.'
      : analysis.status === 'meets-target'
        ? 'This offer matches your saved monthly income target for the project period.'
        : analysis.status === 'exceeds-target'
          ? 'This offer exceeds your saved monthly income target.'
          : 'Complete the workload and duration fields to assess this offer.'
  const statusTone = analysis.status === 'below-expenses' ? 'text-red-300' : analysis.status === 'incomplete' ? 'text-gray-400' : 'text-[#54264F]'
  const recommendation = targetMissing
    ? 'Add your Target Monthly Income in Edit Profile before using target-based offer comparisons. Your current income and runway remain separate.'
    : !analysis.complete
      ? 'Enter a non-negative offer, project duration, daily hours, and working days to get a practical comparison.'
    : analysis.status === 'below-expenses'
      ? `The offer is ${money(Math.abs(analysis.minimumDifference))} below the estimated project expenses. Consider negotiating at least ${money(analysis.minimumOffer)} or adjusting the scope or duration.`
      : analysis.status === 'below-target'
        ? `The offer is ${money(Math.abs(analysis.targetDifference))} below your saved monthly income target. Consider whether the lower effective rate is acceptable for this project.`
        : analysis.status === 'meets-target'
          ? 'This offer meets the benchmark based on your saved monthly expenses and income target.'
          : 'This offer exceeds your benchmark. Confirm that the scope, payment schedule, and workload are realistic.'

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] px-5 py-8 text-[#29252A] sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#54264F]">← Back to dashboard</Link>
        <header className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#54264F]">Offer Analysis</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Should you take this offer?</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-400">Compare a client offer with your monthly financial baseline and the hours required to deliver the project.</p>
        </header>

        <div className="mt-7 grid overflow-hidden rounded-2xl border border-[#E8E3ED] bg-[#F4F0F6] md:grid-cols-[1.05fr_0.95fr]">
          <div className="relative aspect-[4/3] md:min-h-[320px]">
            <Image src={runrateImages.offerReview} alt="Black African man and woman collaborating over notes in a warmly lit library" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[center_38%]" />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#54264F]">Consider the whole picture</p>
            <p className="mt-3 text-2xl leading-tight sm:text-3xl">Evaluate the offer, not just the number.</p>
            <p className="mt-3 text-sm leading-6 text-[#625b6b]">Compare the workload and project period with your expenses and target before deciding.</p>
          </div>
        </div>
        <section aria-label="Saved income profile" className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E8E3ED] bg-[#FFFFFF] p-5"><p className="text-sm text-gray-400">Current Average Monthly Income</p><p className="mt-2 text-xl font-semibold">{money(monthlyIncomeCurrent)}</p><p className="mt-1 text-xs text-gray-500">Used for current financial runway, not treated as guaranteed project income.</p></div>
          <div className="rounded-xl border border-[#E8E3ED] bg-[#FFFFFF] p-5"><p className="text-sm text-gray-400">Target Monthly Income</p><p className="mt-2 text-xl font-semibold text-[#54264F]">{monthlyIncomeTarget === null ? 'Not set' : money(monthlyIncomeTarget)}</p><p className="mt-1 text-xs text-gray-500">Used to calculate your target offer and target hourly rate.</p></div>
        </section>
        {targetMissing && <p role="status" className="mt-4 rounded-xl border border-[#54264F]/50 bg-[#F4F0F6] p-4 text-sm leading-6 text-gray-200">Add a Target Monthly Income in <Link href="/onboarding" className="font-semibold text-[#54264F] underline">Edit Profile</Link> before target-based calculations can be used.</p>}

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Offer details</h2>
            <p className="mt-1 text-sm text-gray-500">Your saved currency and profile figures are used automatically.</p>
            <div className="mt-6 grid gap-5">
              <label htmlFor="offer-category" className="text-sm font-semibold text-gray-300">Freelancer category<select id="offer-category" value={categories.includes(selectedCategory) ? selectedCategory : categories[0] ?? ''} onChange={(event) => setCategory(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]">{categories.map((item) => <option key={item} value={item}>{categoryLabel(item)}</option>)}</select></label>
              <label htmlFor="offer-amount" className="text-sm font-semibold text-gray-300">Total client offer amount<input id="offer-amount" type="number" min="0" step="0.01" inputMode="decimal" value={offer} onChange={(event) => setOffer(event.target.value)} placeholder="Example: 2500" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]" /></label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="hours-per-day" className="text-sm font-semibold text-gray-300">Working hours per day<input id="hours-per-day" type="number" min="0.1" max="24" step="0.5" inputMode="decimal" value={hoursPerDay} onChange={(event) => setHoursPerDay(event.target.value)} placeholder="Example: 6" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]" /></label>
                <label htmlFor="days-per-week" className="text-sm font-semibold text-gray-300">Working days per week<input id="days-per-week" type="number" min="0.1" max="7" step="1" inputMode="numeric" value={daysPerWeek} onChange={(event) => setDaysPerWeek(event.target.value)} placeholder="Example: 5" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]" /></label>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label htmlFor="project-duration" className="text-sm font-semibold text-gray-300">Project duration<input id="project-duration" type="number" min="0.1" max="120" step="0.1" inputMode="decimal" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Example: 2" className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]" /></label>
                <label htmlFor="duration-unit" className="text-sm font-semibold text-gray-300">Duration unit<select id="duration-unit" value={durationUnit} onChange={(event) => setDurationUnit(event.target.value as DurationUnit)} className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6F3] px-4 font-normal text-[#29252A] outline-none focus:border-[#54264F]"><option value="days">Days</option><option value="weeks">Weeks</option><option value="months">Months</option></select></label>
              </div>
            </div>
          </div>

          <div aria-live="polite" className="rounded-2xl border border-[#54264F]/50 bg-[#FFFFFF] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#54264F]">Financial assessment · {categoryLabel(selectedCategory)}</p>
            <p className={`mt-4 text-xl font-semibold leading-8 ${statusTone}`}>{statusText}</p>
            <p className="mt-5 text-sm leading-6 text-gray-400">{analysis.complete ? `For your ${categoryLabel(selectedCategory)} work, at ${Number(hoursPerDay)} hours per day and ${Number(daysPerWeek)} days per week, this project is estimated at ${analysis.totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hours. The offer works out to ${money(analysis.hourlyRate)} per hour.` : 'Enter a non-negative offer, duration, and valid workload to calculate an assessment.'}</p>
          </div>
        </section>

        <section aria-label="Offer calculations" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ResultCard label="Estimated project hours" value={analysis.complete ? `${analysis.totalHours.toLocaleString(undefined, { maximumFractionDigits: 1 })} hours` : '—'} />
          <ResultCard label="Effective hourly rate" value={analysis.complete ? `${money(analysis.hourlyRate)} / hour` : '—'} />
          <ResultCard label="Break-even hourly rate" value={analysis.complete ? `${money(analysis.breakEvenRate)} / hour` : '—'} />
          <ResultCard label="Target hourly rate" value={analysis.complete ? `${money(analysis.targetRate)} / hour` : '—'} />
          <ResultCard label="Minimum viable offer" value={analysis.complete ? money(analysis.minimumOffer) : '—'} />
          <ResultCard label="Target offer" value={analysis.complete ? money(analysis.targetOffer) : '—'} />
          <ResultCard label="Target covered" value={analysis.complete ? `${Math.max(0, analysis.targetCoverage).toFixed(1)}%` : '—'} />
          <ResultCard label="After project expenses" value={analysis.complete ? signedMoney(analysis.netProjectContribution) : '—'} />
          <ResultCard label="Monthly equivalent" value={analysis.complete ? money(analysis.monthlyEquivalent) : '—'} />
        </section>

        <section className="mt-6 rounded-2xl border border-[#54264F]/60 bg-[#FFFFFF] p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#54264F]">What would make this offer worthwhile?</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">The minimum covers monthly expenses prorated to the project duration. The target uses your saved Target Monthly Income, prorated to the same period; it is a goal, not guaranteed income, and remains separate from current income and the expense minimum.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ComparisonCard label="Client offer" amount={analysis.offer} difference={null} complete={analysis.complete} money={money} />
            <ComparisonCard label="Minimum viable offer" amount={analysis.minimumOffer} difference={analysis.minimumDifference} complete={analysis.complete} money={money} />
            <ComparisonCard label="Target offer" amount={analysis.targetOffer} difference={analysis.targetDifference} complete={analysis.complete} money={money} />
          </div>
            <div className="mt-7 grid gap-4 rounded-xl bg-[#F8F6F3] p-5" aria-label="Offer benchmark comparison">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#54264F]">Offer against your benchmarks</p>
              {[['Client offer', analysis.offer], ['Minimum viable', analysis.minimumOffer], ['Income target', analysis.targetOffer]].map(([label, amount]) => {
                const numericAmount = Number(amount)
                const scale = Math.max(analysis.offer, analysis.minimumOffer, analysis.targetOffer, 1)
                return <div key={String(label)}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-[#625b6b]">{label}</span><span className="font-semibold text-[#29252A]">{analysis.complete ? money(numericAmount) : '—'}</span></div><div className="h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#54264F] transition-[width] duration-500" style={{ width: `${analysis.complete ? Math.max(0, Math.min(100, numericAmount / scale * 100)) : 0}%` }} /></div></div>
              })}
            </div>
            <p className="mt-6 text-sm leading-7 text-gray-500">{recommendation}</p>
            <button type="button" onClick={() => setShowBreakdown((current) => !current)} aria-expanded={showBreakdown} aria-controls="offer-method" className="mt-4 min-h-11 rounded-full border border-[#54264F]/35 px-4 text-sm font-semibold text-[#54264F] hover:bg-[#F4F0F6]">{showBreakdown ? 'Hide calculation notes' : 'How we compare this offer'}</button>
            {showBreakdown && <div id="offer-method" className="mt-4 rounded-xl border border-[#E8E3ED] bg-[#F8F6F3] p-5 text-sm leading-6 text-[#625b6b]"><p><strong className="text-[#29252A]">Project time:</strong> daily hours × work days per week × duration, converted to consistent weeks.</p><p className="mt-2"><strong className="text-[#29252A]">Minimum:</strong> monthly expenses prorated across the project period. <strong className="text-[#29252A]">Target:</strong> your saved target income prorated over that same period.</p><p className="mt-2">The chart compares the full client offer with those two benchmarks. It is a planning estimate, not tax or legal advice.</p></div>}
          </section>

        <section className="mt-6 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6 sm:p-8">
          <h2 className="text-xl font-bold">Runway effect, separate from profitability</h2>
          <p className="mt-3 text-sm leading-7 text-gray-400">Your current runway is <strong className="text-[#29252A]">{runwayLabel(analysis.currentRunway)}</strong>. If the full offer is paid and its estimated project expenses are subtracted before the remaining amount is added to savings, runway becomes <strong className="text-[#29252A]">{analysis.complete ? runwayLabel(analysis.runwayAfterOffer) : '—'}</strong>.</p>
          <p className="mt-4 text-sm leading-7 text-gray-300">{monthlyPositionText}</p>
          <p className="mt-4 text-sm leading-7 text-gray-500">Assumptions: a month is 4.345 weeks or 30.4375 days; project expenses scale with duration. This is an end-of-project estimate, not a payment-timing forecast, and excludes taxes, unpaid work, and other costs.</p>
        </section>
      </div>
    </main>
  )
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl border border-[#E8E3ED] bg-[#FFFFFF] p-6"><p className="text-sm text-gray-400">{label}</p><p className="mt-3 break-words text-2xl font-bold text-[#54264F]">{value}</p></div>
}

function ComparisonCard({ label, amount, difference, complete, money }: { label: string; amount: number; difference: number | null; complete: boolean; money: (value: number) => string }) {
  return <div className="rounded-xl border border-[#333] p-5"><p className="text-sm text-gray-400">{label}</p><p className="mt-2 break-words text-2xl font-bold">{complete ? money(amount) : '—'}</p>{difference !== null && <p className="mt-2 text-sm text-gray-400">Difference: {complete ? `${difference < 0 ? '-' : ''}${money(difference)}` : '—'}</p>}</div>
}
