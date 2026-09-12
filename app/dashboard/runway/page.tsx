'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RunwayPage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user == null) return
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      setProfile(data)
    }
    loadProfile()
  }, [])

  if (profile == null) return <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></main>

  const currency = profile.currency === "NGN" ? "₦" : "$"
  const savings = Number(profile.savings)
  const expenses = Number(profile.expenses)
  const months = expenses > 0 ? savings / expenses : 0

  return (
    <main className="min-h-screen bg-[#050505] text-white px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-[#D4AF37]">← Back to Dashboard</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.15em] text-[#D4AF37]">Financial Runway</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">How long can your savings support you?</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-400">Your current runway is based on your savings and monthly expenses.</p>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <p className="text-sm text-gray-400">Current Savings</p>
            <p className="mt-3 text-3xl font-bold text-[#D4AF37]">{currency}{savings.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#0b0b0b] p-6">
            <p className="text-sm text-gray-400">Monthly Expenses</p>
            <p className="mt-3 text-3xl font-bold">{currency}{expenses.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D4AF37]/40 bg-[#0b0b0b] p-8">
          <p className="text-sm text-gray-400">Estimated Runway</p>
          <p className="mt-3 text-5xl font-bold text-[#D4AF37]">{months.toFixed(1)} months</p>
          <p className="mt-4 text-sm leading-6 text-gray-400">This is an estimate based on your current savings and monthly expenses. Your actual runway can change as your income and expenses change.</p>
        </div>
      </div>
    </main>
  )
}
