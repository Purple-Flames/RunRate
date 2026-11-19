'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useUserProfile } from '@/lib/supabase/use-profile'

const presetCategories = ['Designer', 'Developer', 'Writer', 'Marketer', 'Consultant']

export default function OnboardingPage() {
  const router = useRouter()
  const { data: account, error: profileLoadError, isLoading, mutate } = useUserProfile()
  const initialized = useRef(false)
  const [categories, setCategories] = useState<string[]>([])
  const [customCategory, setCustomCategory] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [expenses, setExpenses] = useState('')
  const [savings, setSavings] = useState('')
  const [income, setIncome] = useState('')
  const [targetIncome, setTargetIncome] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (isLoading || profileLoadError) return
    if (!account) router.replace('/login')
  }, [account, isLoading, profileLoadError, router])

  useEffect(() => {
    const profile = account?.profile
    if (!profile || initialized.current) return
    const savedCategories = Array.isArray(profile.category) ? profile.category : profile.category ? [profile.category] : []
    setCategories(savedCategories.filter((item): item is string => typeof item === 'string' && item.length > 0))
    setCurrency(profile.currency || 'NGN')
    setExpenses(String(profile.expenses ?? ''))
    setSavings(String(profile.savings ?? ''))
    setIncome(String(profile.income ?? ''))
    setTargetIncome(profile.target_monthly_income == null ? '' : String(profile.target_monthly_income))
    initialized.current = true
  }, [account?.profile])

  function toggleCategory(category: string, checked: boolean) {
    setCategories((current) => checked
      ? current.includes(category) ? current : [...current, category]
      : current.filter((item) => item !== category))
  }

  function addCustomCategory() {
    const value = customCategory.trim()
    if (!value) return
    setCategories((current) => current.some((item) => item.toLowerCase() === value.toLowerCase()) ? current : [...current, value])
    setCustomCategory('')
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    if (!account) {
      setFormError('Your session has expired. Sign in again before saving.')
      return
    }
    if (categories.length === 0) {
      setFormError('Choose at least one freelancer category.')
      return
    }

    const values = [expenses, savings, income, targetIncome].map((value) => value.trim() === '' ? Number.NaN : Number(value))
    if (values.some((value) => !Number.isFinite(value) || value < 0)) {
      setFormError('Enter a valid non-negative amount for each financial field.')
      return
    }

    setBusy(true)
    try {
      const supabase = createClient()
      const profileValues = {
        category: categories,
        currency,
        expenses: values[0],
        savings: values[1],
        income: values[2],
        target_monthly_income: values[3],
      }
      const { error } = account.profile
        ? await supabase.from('profiles').update(profileValues).eq('id', account.userId)
        : await supabase.from('profiles').insert({ id: account.userId, ...profileValues })
      if (error) throw error

      await mutate({
        userId: account.userId,
        profile: { category: categories, currency, expenses: values[0], savings: values[1], income: values[2], target_monthly_income: values[3] },
      }, { revalidate: false })
      router.push('/dashboard')
    } catch (caught) {
      const code = typeof caught === 'object' && caught !== null && 'code' in caught ? String(caught.code) : ''
      setFormError(code === '42703' || code === 'PGRST204'
        ? 'The Target Monthly Income field is not available in the database yet. The included migration must be applied before this profile can be saved.'
        : 'We could not save your profile. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (isLoading || (!profileLoadError && !account)) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-[#241d2e]"><p role="status" className="text-sm text-gray-400">Loading your profile…</p></main>
  }

  if (profileLoadError) {
    return <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-6 text-center text-[#241d2e]"><div className="max-w-md"><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-3 text-sm text-gray-400">We could not load your saved profile. Try again or sign in again.</p><Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-[#6842A6] px-4 text-sm text-[#6842A6]">Sign in</Link></div></main>
  }

  if (!account) return null

  const editing = Boolean(account.profile)

  return (
    <main className="min-h-screen w-full bg-[#FFFFFF] text-[#241d2e]">
      <header className="w-full border-b border-[#222] px-6 py-5"><Link href="/" className="text-xl font-bold">Run<span className="text-[#6842A6]">Rate</span></Link></header>
      <form onSubmit={handleSave} className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#6842A6]">Profile Setup</p>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">Let&apos;s get your RunRate ready.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">Your saved categories and financial figures are prefilled when editing. Saving updates these profile fields without changing your sign-in method.</p>

        <div className="mt-10 grid w-full gap-8 lg:grid-cols-2">
          <fieldset className="min-w-0">
            <legend className="text-sm font-bold">Freelancer category</legend>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {presetCategories.map((item) => (
                <label key={item} className="flex min-h-12 items-center gap-3 rounded-xl border border-[#E8E3ED] bg-[#F8F6FA] px-4 py-3 text-sm text-[#241d2e]">
                  <input type="checkbox" checked={categories.includes(item)} onChange={(event) => toggleCategory(item, event.target.checked)} className="h-5 w-5 accent-[#6842A6]" />
                  {item}
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="custom-category" className="sr-only">Add another category</label>
              <input id="custom-category" value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="Add another category" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#444] bg-[#F8F6FA] px-4 text-sm text-[#241d2e]" />
              <button type="button" onClick={addCustomCategory} className="min-h-12 rounded-xl border border-[#6842A6] px-5 text-sm font-semibold text-[#6842A6]">Add category</button>
            </div>
            {categories.filter((item) => !presetCategories.includes(item)).length > 0 && (
              <ul aria-label="Additional categories" className="mt-4 flex flex-wrap gap-2">
                {categories.filter((item) => !presetCategories.includes(item)).map((item) => (
                  <li key={item} className="flex items-center gap-2 rounded-full border border-[#4b4024] px-3 py-1 text-sm text-gray-200">
                    <span>{item}</span><button type="button" aria-label={`Remove ${item}`} onClick={() => setCategories((current) => current.filter((category) => category !== item))} className="text-[#6842A6]">Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>

          <div>
            <label htmlFor="currency" className="block text-sm font-bold">Currency</label>
            <select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-3 min-h-12 w-full rounded-xl border border-[#444] bg-[#F8F6FA] px-4 text-sm text-[#241d2e]">
              <option value="NGN">Nigerian Naira (₦)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid w-full gap-6 sm:grid-cols-2">
          <FinancialInput id="expenses" label="Monthly expenses" value={expenses} onChange={setExpenses} currency={currency} />
          <FinancialInput id="savings" label="Current savings" value={savings} onChange={setSavings} currency={currency} />
        </div>
        <div className="mt-6 grid w-full gap-6 sm:grid-cols-2">
          <FinancialInput id="income" label="Current Average Monthly Income" help="How much do you currently earn on average each month?" value={income} onChange={setIncome} currency={currency} />
          <FinancialInput id="target-income" label="Target Monthly Income" help="How much would you like to earn each month?" value={targetIncome} onChange={setTargetIncome} currency={currency} />
        </div>

        {formError && <p role="alert" className="mt-6 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{formError}</p>}
        <div className="mt-8 flex w-full justify-end">
          <button type="submit" disabled={busy || isLoading} className="min-h-12 w-full rounded-xl bg-[#6842A6] px-8 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{busy ? 'Saving profile…' : editing ? 'Save changes' : 'Save profile'}</button>
        </div>
      </form>
    </main>
  )
}

function FinancialInput({ id, label, help, value, onChange, currency }: { id: string; label: string; help?: string; value: string; onChange: (value: string) => void; currency: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold">{label}</label>
      {help && <p id={`${id}-help`} className="mt-1 text-xs leading-5 text-gray-400">{help}</p>}
      <div className="mt-3 flex min-h-12 items-center rounded-xl border border-[#444] bg-[#F8F6FA] focus-within:border-[#6842A6]">
        <span aria-hidden="true" className="px-4 text-sm text-gray-400">{currency === 'USD' ? '$' : '₦'}</span>
        <input id={id} aria-describedby={help ? `${id}-help` : undefined} value={value} onChange={(event) => onChange(event.target.value)} type="number" min="0" step="0.01" required inputMode="decimal" placeholder="Enter an amount" className="min-h-12 min-w-0 flex-1 rounded-r-xl bg-transparent pr-4 text-sm text-[#241d2e] outline-none placeholder:text-[#777]" />
      </div>
    </div>
  )
}
