"use client"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

import { useState } from "react"

export default function OnboardingPage() {
  const router = useRouter()
  const [category, setCategory] = useState("")
  const [currency, setCurrency] = useState("NGN")
  const [expenses, setExpenses] = useState("")
  const [savings, setSavings] = useState("")
  const [income, setIncome] = useState("")

  return (
    <main className="min-h-screen w-full bg-[#050505] text-white">
      <header className="w-full border-b border-[#222] px-6 py-5">
        <span className="text-xl font-bold">Run<span className="text-[#D4AF37]">Rate</span></span>
      </header>
      <section className="min-h-[calc(100vh-73px)] w-full px-6 py-10 sm:px-10 lg:px-16">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Profile Setup</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Let&apos;s get your RunRate ready.</h1>
        <div className="mt-10 grid w-full gap-8 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-bold">Freelancer Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-3 h-14 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-base text-white">
              <option value="">Select your category</option>
              <option value="designer">Designer</option>
              <option value="developer">Developer</option>
              <option value="writer">Writer</option>
              <option value="marketer">Marketer</option>
              <option value="consultant">Consultant</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-3 h-14 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-base text-white">
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>
        <div className="mt-8 grid w-full gap-8 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-bold">Monthly Expenses</label>
            <input value={expenses} onChange={(e) => setExpenses(e.target.value)} type="number" placeholder="Enter your monthly expenses" className="mt-3 h-14 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-base text-white placeholder:text-[#777]" />
          </div>
          <div>
            <label className="block text-sm font-bold">Current Savings</label>
            <input value={savings} onChange={(e) => setSavings(e.target.value)} type="number" placeholder="Enter your current savings" className="mt-3 h-14 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-base text-white placeholder:text-[#777]" />
          </div>
        </div>
        <div className="mt-8 w-full">
          <label className="block text-sm font-bold">Average Monthly Income</label>
          <input value={income} onChange={(e) => setIncome(e.target.value)} type="number" placeholder="Enter your average monthly income" className="mt-3 h-14 w-full rounded-xl border border-[#444] bg-[#111] px-4 text-base text-white placeholder:text-[#777]" />
        </div>
        <div className="mt-10 flex w-full justify-end">
          <button type="button" onClick={async () => { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user === null) { alert("Please log in again."); return; } const { error } = await supabase.from("profiles").upsert({ id: user.id, category, currency, expenses: Number(expenses), savings: Number(savings), income: Number(income) }); if (error) { alert(error.message); return; } router.push("/dashboard"); }} className="h-14 w-full rounded-xl bg-[#D4AF37] px-8 text-base font-bold text-black sm:w-auto">Save Profile</button>
        </div>
      </section>
    </main>
  )
}
