'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RateCalculatorPage() {
  const [profile, setProfile] = useState<any>(null)
  const [targetIncome, setTargetIncome] = useState('')
  const [hours, setHours] = useState('')

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user == null) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (data) {
        setProfile(data)
        setTargetIncome(String(data.income))
      }
    }

    loadProfile()
  }, [])

  if (profile == null) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  const currencySymbol = profile.currency === 'NGN' ? '₦' : '$'
  const income = Number(targetIncome)
  const billableHours = Number(hours)

  const suggestedRate =
    billableHours > 0 ? income / billableHours : 0

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">

        <Link
          href="/dashboard"
          className="text-sm text-gray-400 hover:text-[#D4AF37]"
        >
          ← Back to Dashboard
        </Link>

        <section className="mt-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
            Rate Calculator
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            What should you charge?</h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
            Calculate a starting hourly rate based on your monthly income target and expected billable hours.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <label className="block text-sm font-semibold text-gray-300">
              Monthly income target
            </label>

            <input
              type="number"
              value={targetIncome}
              onChange={(e) => setTargetIncome(e.target.value)}
              className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <p className="mt-2 text-xs text-gray-500">
              Your saved average monthly income is used as the starting point.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <label className="block text-sm font-semibold text-gray-300">
              Billable hours per month
            </label>

            <input
              type="number"
              min="1"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Example: 80"
              className="mt-3 h-12 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-white outline-none focus:border-[#D4AF37]"
            />

            <p className="mt-2 text-xs text-gray-500">
              Enter the hours you realistically expect to bill clients.
            </p>
          </div>

        </section>

        <section className="mt-6 rounded-2xl border border-[#D4AF37]/50 bg-[#0b0b0b] p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
            Suggested starting rate
          </p>

          <p className="mt-4 text-4xl font-bold text-[#D4AF37] sm:text-5xl">
            {currencySymbol}
            {suggestedRate.toLocaleString(undefined, {
              maximumFractionDigits: 2
            })}
            <span className="ml-2 text-lg font-normal text-gray-400">
              / hour
            </span>
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400">
            This is a starting estimate based on your income target divided by your expected billable hours.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
            Your saved profile
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">

            <div>
              <p className="text-sm text-gray-500">
                Monthly Expenses
              </p>
              <p className="mt-2 font-semibold">
                {currencySymbol}
                {Number(profile.expenses).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Current Savings
              </p>
              <p className="mt-2 font-semibold">
                {currencySymbol}
                {Number(profile.savings).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Average Monthly Income
              </p>
              <p className="mt-2 font-semibold text-[#D4AF37]">
                {currencySymbol}
                {Number(profile.income).toLocaleString()}
              </p>
            </div>

          </div>
        </section>

      </div>
    </main>
  )
}
