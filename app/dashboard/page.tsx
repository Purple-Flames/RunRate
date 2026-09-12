'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import LogoutButton from './LogoutButton'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)

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

      setProfile(data)
    }

    loadProfile()
  }, [])

  if (profile == null) {
    return (
      <main className="min-h-screen w-full bg-[#050505] text-white flex items-center justify-center px-6">
        <p className="text-base text-gray-400">Loading your dashboard...</p>
      </main>
    )
  }

  const currencySymbol = profile.currency === 'NGN' ? '₦' : '$'
  const categoryDisplay = Array.isArray(profile.category) ? profile.category.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join(' · ') : profile.category

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white">
      <div className="min-h-screen w-full px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex flex-col gap-5 border-b border-[#222] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              RunRate
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 text-base text-gray-400">
              Your freelancer profile and financial starting point.
            </p>
          </div>

          <div className="rounded-full border border-[#333] px-4 py-2 text-sm text-gray-300">
            {categoryDisplay}
          </div>
         <LogoutButton />
        <Link href="/onboarding" className="rounded-lg border border-[#333] px-4 py-2 text-sm text-gray-300">Edit Profile</Link>
</header>

        <section className="py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your profile
            </h2>
            <p className="mt-2 text-base text-gray-400">
              This is the information you saved during setup.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <p className="text-sm text-gray-400">Freelancer Category</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {categoryDisplay}
              </p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <p className="text-sm text-gray-400">Currency</p>
              <p className="mt-3 text-xl font-semibold text-[#D4AF37]">
                {profile.currency}
              </p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <p className="text-sm text-gray-400">Monthly Expenses</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {currencySymbol}{Number(profile.expenses).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
              <p className="text-sm text-gray-400">Current Savings</p>
              <p className="mt-3 text-xl font-semibold text-white">
                {currencySymbol}{Number(profile.savings).toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:col-span-2 lg:col-span-4">
              <p className="text-sm text-gray-400">Average Monthly Income</p>
              <p className="mt-3 text-2xl font-bold text-[#D4AF37]">
                {currencySymbol}{Number(profile.income).toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-[#222] py-8">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">
              Next
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              Build your financial picture
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">
              RunRate will use your profile together with your work and offer
              details to help you understand pricing and financial runway.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
