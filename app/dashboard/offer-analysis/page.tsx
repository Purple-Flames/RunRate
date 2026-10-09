'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  currency: string
  expenses: number
  savings: number
  income: number
}

export default function OfferAnalysisPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [offer, setOffer] = useState('')
  const [duration, setDuration] = useState('')
  const [hours, setHours] = useState('')
  const [expenses, setExpenses] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user == null) return

      const { data } = await supabase
        .from('profiles')
        .select('currency, expenses, savings, income')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setExpenses(String(data.expenses))
      }
    }

    loadProfile()
  }, [])

  const analysis = useMemo(() => {
    const totalOffer = Number(offer)
    const months = Number(duration)
    const totalHours = Number(hours)
    const monthlyExpenses = Number(expenses)
    const monthlyEquivalent = months > 0 ? totalOffer / months : 0
    const hourlyRate = totalHours > 0 ? totalOffer / totalHours : 0
    const surplus = monthlyEquivalent - monthlyExpenses
    const runway = monthlyExpenses > 0 ? Number(profile?.savings ?? 0) / monthlyExpenses : 0
    const incomeCoverage = Number(profile?.income ?? 0) > 0 ? monthlyEquivalent / Number(profile?.income) : 0

    let verdict = 'Add the offer details to see a recommendation.'
    let tone = 'text-gray-400'
    if (totalOffer > 0 && months > 0 && totalHours > 0 && monthlyExpenses > 0) {
      if (surplus >= 0 && incomeCoverage >= 0.8) {
        verdict = 'Strong offer: it covers your monthly needs and is close to your income target.'
        tone = 'text-[#D4AF37]'
      } else if (surplus >= 0) {
        verdict = 'Worth reviewing: it covers your monthly expenses, but compare it with your income target.'
        tone = 'text-[#D4AF37]'
      } else {
        verdict = 'Proceed carefully: this offer does not cover your saved monthly expenses.'
        tone = 'text-red-300'
      }
    }

    return { monthlyEquivalent, hourlyRate, surplus, runway, verdict, tone }
  }, [duration, expenses, hours, offer, profile])

  if (profile == null) {
    return <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><p className="text-gray-400">Loading...</p></main>
  }

  const currency = profile.currency === 'NGN' ? '₦' : '$'
  const format = (value: number) => `${currency}${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

  return (
    <main className="min-h-screen w-full bg-[#050505] px-5 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#D4AF37]">← Back to Dashboard</Link>

        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Offer Analysis</p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Should you take this offer?</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Compare a freelance offer with your saved financial baseline before you commit.</p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:p-8">
            <div>
              <p className="text-lg font-semibold">Offer details</p>
              <p className="mt-1 text-sm text-gray-500">Use the full project value, not just the first payment.</p>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-300">Total offer value
                <input type="number" min="0" value={offer} onChange={(event) => setOffer(event.target.value)} placeholder="Example: 2500" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" />
              </label>
              <label className="text-sm font-semibold text-gray-300">Project duration (months)
                <input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Example: 2" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" />
              </label>
              <label className="text-sm font-semibold text-gray-300">Estimated total hours
                <input type="number" min="1" value={hours} onChange={(event) => setHours(event.target.value)} placeholder="Example: 40" className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" />
              </label>
              <label className="text-sm font-semibold text-gray-300">Monthly expenses
                <input type="number" min="0" value={expenses} onChange={(event) => setExpenses(event.target.value)} className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 font-normal text-white outline-none focus:border-[#D4AF37]" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/50 bg-[#0b0b0b] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Recommendation</p>
            <p className={`mt-4 text-xl font-semibold leading-8 ${analysis.tone}`}>{analysis.verdict}</p>
            <div className="mt-8 border-t border-[#2a2a2a] pt-6">
              <p className="text-sm text-gray-500">Offer rate</p>
              <p className="mt-2 text-3xl font-bold text-white">{format(analysis.hourlyRate)}<span className="ml-2 text-base font-normal text-gray-500">/ hour</span></p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6"><p className="text-sm text-gray-400">Monthly equivalent</p><p className="mt-3 text-2xl font-bold text-[#D4AF37]">{format(analysis.monthlyEquivalent)}</p></div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6"><p className="text-sm text-gray-400">After expenses</p><p className={`mt-3 text-2xl font-bold ${analysis.surplus >= 0 ? 'text-white' : 'text-red-300'}`}>{format(analysis.surplus)}</p></div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6"><p className="text-sm text-gray-400">Current runway</p><p className="mt-3 text-2xl font-bold text-white">{analysis.runway.toFixed(1)} <span className="text-base font-normal text-gray-500">months</span></p></div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6"><p className="text-sm text-gray-400">Income target</p><p className="mt-3 text-2xl font-bold text-white">{format(profile.income)}</p></div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">How to read this</p>
          <div className="mt-5 grid gap-5 text-sm leading-6 text-gray-400 md:grid-cols-3">
            <p><strong className="text-white">Monthly equivalent</strong><br />Spreads the project value across its expected duration.</p>
            <p><strong className="text-white">After expenses</strong><br />Shows what the offer leaves after your saved monthly costs.</p>
            <p><strong className="text-white">Offer rate</strong><br />Makes it easier to compare the project with your pricing floor.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

