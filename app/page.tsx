"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { runrateImages } from "@/lib/images"
import { formatCurrency } from "@/lib/finance";

function RunwayPreview() {
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN')
  const [income, setIncome] = useState('')
  const [expenses, setExpenses] = useState('')
  const [savings, setSavings] = useState('')
  const values = [income, expenses, savings].map((value) => value.trim() === '' ? Number.NaN : Number(value))
  const complete = values.every((value) => Number.isFinite(value) && value >= 0)
  const [monthlyIncome, monthlyExpenses, currentSavings] = values
  const deficit = complete ? Math.max(0, monthlyExpenses - monthlyIncome) : 0
  const runway = complete && deficit > 0 ? currentSavings / deficit : null

  return (
    <div className="rounded-2xl border border-[#E8E3ED] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#54264F]">Try a real calculation</p><h3 className="mt-2 text-2xl">Your runway, in a few numbers.</h3><p className="mt-2 text-sm leading-6 text-[#625b6b]">An on-page example. Nothing is saved.</p></div><label className="text-xs font-semibold text-[#625b6b]" htmlFor="preview-currency">Currency<select id="preview-currency" value={currency} onChange={(event) => setCurrency(event.target.value as 'NGN' | 'USD')} className="mt-1 block min-h-10 rounded-lg border border-[#E8E3E9] bg-[#F8F6F3] px-3 text-sm text-[#29252A]"><option value="NGN">NGN</option><option value="USD">USD</option></select></label></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <PreviewInput label="Current monthly income" id="preview-income" value={income} onChange={setIncome} currency={currency} />
        <PreviewInput label="Monthly expenses" id="preview-expenses" value={expenses} onChange={setExpenses} currency={currency} />
        <PreviewInput label="Current savings" id="preview-savings" value={savings} onChange={setSavings} currency={currency} />
      </div>
      <div className="mt-5 rounded-xl bg-[#F4F0F6] p-5" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#54264F]">Estimated runway</p>
        {!complete ? <p className="mt-2 text-sm text-[#625b6b]">Enter all three non-negative amounts to see your result.</p> : runway === null ? <><p className="mt-2 text-2xl font-semibold text-[#54264F]">No monthly drawdown</p><p className="mt-1 text-sm leading-6 text-[#625b6b]">Current income covers your expenses. Savings are not being drawn down for these costs.</p></> : <><p className="mt-2 text-3xl font-semibold text-[#54264F]">{runway.toFixed(1)} months</p><p className="mt-1 text-sm leading-6 text-[#625b6b]">With a monthly shortfall of {formatCurrency(deficit, currency)}, savings could cover approximately {runway.toFixed(1)} months at this pace.</p></>}
      </div>
      <p className="mt-3 text-xs leading-5 text-[#726b73]">Assumes income and expenses stay constant. Excludes tax, irregular costs, and changes in client work.</p>
    </div>
  )
}

function PreviewInput({ label, id, value, onChange, currency }: { label: string; id: string; value: string; onChange: (value: string) => void; currency: 'NGN' | 'USD' }) {
  return <div><label htmlFor={id} className="block text-xs font-semibold leading-5 text-[#625b6b]">{label} ({currency})</label><input id={id} type="number" min="0" step="0.01" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#E8E3E9] bg-[#F8F6F3] px-3 text-sm text-[#29252A]" placeholder="Enter amount" /></div>
}

const landingFeatures = [
  { number: '01', title: 'Financial Runway', summary: 'See how current income, monthly expenses, and savings shape your runway.', detail: 'Adjust your monthly numbers in a private what-if studio. Watch the savings projection respond as your income or costs change.', route: '/login', action: 'Explore runway' },
  { number: '02', title: 'Rate Calculator', summary: 'Find a minimum and target-based hourly rate from your own numbers and billable hours.', detail: 'Set a realistic monthly billable-hours target and instantly compare your expense floor with the rate that supports your goals.', route: '/login', action: 'Explore rate planning' },
  { number: '03', title: 'Offer Analysis', summary: 'Compare a client offer with the time, expenses, and income goal behind the work.', detail: 'Translate project duration and workload into an effective hourly rate, then compare the offer with your minimum and target.', route: '/login', action: 'Explore offer analysis' },
]

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedFeature, setFlippedFeature] = useState<number | null>(null);
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#29252A] overflow-x-hidden">
      {/* Navigation */}
      <header className="homepage-header sticky top-0 z-50 border-b border-[#E8E3ED] bg-[#FFFFFF]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-end gap-1">
                <span className="w-2 h-5 rounded-sm bg-[#54264F]" />
                <span className="w-2 h-8 rounded-sm bg-[#54264F]" />
                <span className="w-2 h-11 rounded-sm bg-[#54264F]" />
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight">
                  Run<span className="text-[#54264F]">Rate</span>
                </div>
                <p className="text-[8px] text-neutral-500">
                  Freelancer Pricing & Runway Tool
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
              <a href="#features" className="hover:text-[#54264F]">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-[#54264F]">
                How It Works
              </a>
              <a href="#resources-heading" className="hover:text-[#54264F]">
                Our approach
              </a>
              <Link href="/signup" className="hover:text-[#54264F]">
                Get started
              </Link>
            </div>

            <div className="hidden sm:flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm text-neutral-300 hover:text-[#29252A]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#54264F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#421E3E]"
              >
                Get Started
                <span className="ml-2">→</span>
              </Link>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden text-neutral-300 text-2xl"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="homepage-mobile-menu"
            >
              <span className="sr-only">{menuOpen ? "Close navigation" : "Open navigation"}</span>
              <span aria-hidden="true" className="flex w-6 flex-col gap-1">
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
                <span className="h-0.5 w-full rounded bg-current" />
              </span>
            </button>
          </nav>

          {menuOpen && (
            <div id="homepage-mobile-menu" className="sm:hidden border-t border-[#E8E3ED] py-5 space-y-4">
              <a href="#features" onClick={() => setMenuOpen(false)} className="block text-neutral-300">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block text-neutral-300">
                How It Works
              </a>
              <a href="#resources-heading" onClick={() => setMenuOpen(false)} className="block text-neutral-300">
                Our approach
              </a>
              <Link href="/login" className="block text-neutral-300">
                Log in
              </Link>
              <Link
                href="/signup"
                className="block w-fit rounded-md bg-[#54264F] px-5 py-3 font-semibold text-white"
              >
                Get Started →
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative border-b border-[#E8E3ED]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(104,66,166,0.10),transparent_32%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-8 items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#54264F]/30 bg-[#54264F]/5 px-4 py-2 text-xs text-neutral-300">
                Built for freelancers · NGN & USD
                <span className="h-2 w-2 rounded-full bg-[#54264F]" />
              </div>

              <h1 className="max-w-2xl text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.02]">
                Know what to{" "}
                <span className="text-[#54264F]">charge.</span>
                <br />
                Understand what it does to your{" "}
                <span className="text-[#54264F]">runway.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base sm:text-lg leading-8 text-neutral-400">
                RunRate helps freelancers set the right rates, plan ahead and
                stay financially in control.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-[#54264F] px-7 py-4 font-semibold text-white hover:bg-[#421E3E]"
                >
                  Get Started Free
                  <span className="ml-3">→</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-[#54264F]/60 px-7 py-4 font-semibold text-[#29252A] hover:bg-[#54264F]/10"
                >
                  See How It Works
                  <span className="ml-3" aria-hidden="true">→</span>
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-5 max-w-lg">
                {[
                  ["01", "100% Private", "Your data is yours."],
                  ["02", "Instant Insights", "See results in real-time."],
                  ["03", "Smarter Decisions", "Price with confidence."],
                ].map(([icon, title, text]) => (
                  <div key={title}>
                    <div className="text-[#54264F] text-xl">{icon}</div>
                    <p className="mt-2 text-xs font-semibold text-[#54264F]">
                      {title}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-neutral-500">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-[#F2EDF8] sm:min-h-[520px]">
              <Image
                src={runrateImages.collaboration}
                alt="Two Black African freelancers collaborating over notes at a warmly lit library table"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#29252A]/35 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#54264F]">Your financial workspace</p>
                <p className="mt-1 text-lg font-semibold text-[#29252A] sm:text-xl">A clearer view of what your work makes possible.</p>
                <p className="mt-3 text-sm leading-6 text-[#625b6b]">Thoughtful tools for the work and life you&apos;re building.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#54264F]">
              BUILT FOR FREELANCERS
            </p>
            <p className="mt-4 text-neutral-400">
              Helping independent professionals price smarter and plan with
              greater financial clarity.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {landingFeatures.map((feature, index) => (
              <article key={feature.title} className={`rounded-2xl border border-[#E8E3ED] p-7 text-left transition-all duration-300 ${index === 1 ? 'bg-[#E9DFF0]' : 'bg-white'} ${flippedFeature === index ? 'ring-2 ring-[#54264F]/30' : 'hover:-translate-y-1'}`}>
                <p className="text-sm font-semibold tracking-[0.18em] text-[#54264F]">{feature.number} <span aria-hidden="true">/</span> RUNRATE TOOLS</p>
                <h3 className="mt-8 text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-3 min-h-12 text-sm leading-6 text-neutral-500">{flippedFeature === index ? feature.detail : feature.summary}</p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={() => setFlippedFeature(flippedFeature === index ? null : index)} aria-expanded={flippedFeature === index} className="min-h-11 rounded-full border border-[#54264F]/40 px-4 text-sm font-semibold text-[#54264F] hover:bg-white/70">{flippedFeature === index ? 'Show overview' : 'Flip for details'}</button>
                  {flippedFeature === index && <button type="button" onClick={() => setActiveFeature(index)} className="min-h-11 rounded-full bg-[#54264F] px-4 text-sm font-semibold text-white hover:bg-[#421E3E]">Interactive preview</button>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {activeFeature !== null && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[#29252A]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={() => setActiveFeature(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="feature-preview-title" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => { if (event.key === 'Escape') setActiveFeature(null) }} tabIndex={-1} className="w-full max-w-lg animate-[page-enter_220ms_ease-out] rounded-t-3xl border border-[#E8E3ED] bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#54264F]">RunRate tool preview</p><h2 id="feature-preview-title" className="mt-2 text-3xl">{landingFeatures[activeFeature].title}</h2></div><button type="button" autoFocus onClick={() => setActiveFeature(null)} aria-label="Close preview" className="grid size-11 shrink-0 place-items-center rounded-full border border-[#E8E3ED] text-xl text-[#54264F] hover:bg-[#F4F0F6]">×</button></div>
            <p className="mt-4 text-sm leading-7 text-[#625b6b]">{landingFeatures[activeFeature].detail}</p>
            <div className="mt-6 rounded-2xl bg-[#F4F0F6] p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#54264F]">Designed around your real numbers</p><p className="mt-2 text-sm leading-6 text-[#625b6b]">Your profile stays yours. Explore assumptions before saving anything, and see how each decision affects your financial picture.</p></div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => setActiveFeature(null)} className="min-h-11 rounded-lg border border-[#E8E3ED] px-5 text-sm font-semibold text-[#54264F]">Keep exploring</button><Link href={landingFeatures[activeFeature].route} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#54264F] px-5 text-sm font-semibold text-white hover:bg-[#421E3E]">{landingFeatures[activeFeature].action}</Link></div>
          </section>
        </div>
      )}

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#F4F0F6] p-6 sm:p-10">
            <div className="grid lg:grid-cols-[0.8fr_1.7fr] gap-10 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#54264F]">
                  HOW IT WORKS
                </p>

                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Five steps to
                  <br />
                  financial clarity
                </h2>

                <div className="mt-10 space-y-7">
                  {[
                    ["01", "Set up your profile", "Add your work category, currency, and separate current and target income."],
                    ["02", "Understand your runway", "See how actual income, expenses, and savings fit together."],
                    ["03", "Calculate your rates", "Use your expenses, target, and billable hours to set a pricing baseline."],
                    ["04", "Evaluate client offers", "Compare the project workload and offer with your financial goals."],
                    ["05", "Make informed decisions", "Explore possibilities, then decide what makes sense for you."],
                  ].map(([number, title, text]) => (
                    <div key={number} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#54264F]/50 text-xs text-[#54264F]">
                        {number}
                      </div>
                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-neutral-500">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <RunwayPreview />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="resources-heading" className="border-b border-[#E8E3ED] bg-[#FAF9FC]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:py-20">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#54264F]">A MORE HUMAN WAY TO PLAN</p>
            <h2 id="resources-heading" className="mt-4 text-3xl sm:text-4xl">Make room for the life around the work.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#625b6b]">Build financial habits that support your ambition without losing sight of rest, perspective, and the people beside you.</p>
            <Link href="/signup" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#54264F] px-5 py-3 text-sm font-semibold text-white hover:bg-[#421E3E]">Start planning <span className="ml-2" aria-hidden="true">→</span></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="overflow-hidden rounded-2xl border border-[#E8E3ED] bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image src={runrateImages.journaling} alt="Black African woman writing in her journal at a library table" fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" className="object-cover object-[center_38%]" />
              </div>
              <div className="p-4"><h3 className="text-xl">Learn at your own pace</h3><p className="mt-1 text-sm leading-6 text-[#625b6b]">Make time to reflect, learn, and plan your next step.</p></div>
            </article>
            <article className="overflow-hidden rounded-2xl border border-[#E8E3ED] bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image src={runrateImages.balance} alt="Black African woman relaxing with headphones and a warm drink in a softly lit library" fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" className="object-cover object-[center_34%]" />
              </div>
              <div className="p-4"><h3 className="text-xl">A steadier kind of growth</h3><p className="mt-1 text-sm leading-6 text-[#625b6b]">Financial clarity should make space for rest, too.</p></div>
            </article>
            <article className="overflow-hidden rounded-2xl border border-[#E8E3ED] bg-white shadow-sm">
              <div className="relative aspect-[4/3]">
                <Image src={runrateImages.maleReading} alt="Black African man relaxing with a book in a warm, quiet library" fill sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 100vw" className="object-cover object-[center_38%]" />
              </div>
              <div className="p-4"><h3 className="text-xl">Space to think</h3><p className="mt-1 text-sm leading-6 text-[#625b6b]">Step back, take in a new perspective, and plan with care.</p></div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#F4F0F6] p-8 sm:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-semibold">
                  Ready to take control
                  <br className="hidden sm:block" /> of your earnings?
                </h2>
                <p className="mt-3 text-neutral-500">
                  Price smarter and build a more secure financial future.
                </p>
              </div>

              <Link
                href="/signup"
                className="shrink-0 rounded-md bg-[#54264F] px-7 py-4 font-semibold text-white hover:bg-[#421E3E]"
              >
                Get Started Free
                <span className="ml-3">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">

            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1">
                  <span className="w-2 h-5 bg-[#54264F]" />
                  <span className="w-2 h-8 bg-[#54264F]" />
                  <span className="w-2 h-11 bg-[#54264F]" />
                </div>
                <span className="text-2xl font-bold">
                  Run<span className="text-[#54264F]">Rate</span>
                </span>
              </div>

              <p className="mt-3 text-sm text-neutral-500">
                Freelancer Pricing & Runway Tool
              </p>

              <p className="mt-8 text-xs text-neutral-600">
                © 2026 RunRate. All rights reserved.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#29252A]">Explore</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-neutral-500">
                <a href="#features" className="hover:text-[#54264F]">Financial tools</a>
                <a href="#how-it-works" className="hover:text-[#54264F]">How it works</a>
                <a href="#resources-heading" className="hover:text-[#54264F]">Our approach</a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#29252A]">Your account</h3>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-neutral-500">
                <Link href="/signup" className="hover:text-[#54264F]">Create an account</Link>
                <Link href="/login" className="hover:text-[#54264F]">Log in</Link>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </main>
  );
}
