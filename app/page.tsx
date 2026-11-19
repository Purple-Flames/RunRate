"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

function RunwayGraph() {
  return (
    <svg
      viewBox="0 0 700 260"
      className="w-full h-full"
      role="img"
      aria-label="Runway projection graph"
    >
      <line
        x1="45"
        y1="78"
        x2="670"
        y2="96"
        stroke="#292929"
        strokeWidth="1"
      />

      <polyline
        points="45,78 170,112 295,128 420,101 545,116 670,96"
        fill="none"
        stroke="#6842A6"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {[
        [45,78],
        [170,112],
        [295,128],
        [420,101],
        [545,116],
        [670,96],
      ].map(([cx, cy], index) => (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r="6"
          fill="#FFFFFF"
          stroke="#6842A6"
          strokeWidth="3"
        />
      ))}
    </svg>
  );
}

function LaptopPreview() {
  return (
    <div className="relative w-full max-w-[620px] mx-auto">
      <div className="relative rounded-[18px] border border-white/15 bg-[#F8F6FA] p-3 shadow-2xl">
        <div className="rounded-[12px] border border-[#E8E3ED] bg-[#FFFFFF] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E3ED]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#6842A6]" />
                <span className="w-2 h-2 rounded-full bg-[#6842A6]" />
                <span className="w-2 h-2 rounded-full bg-[#6842A6]" />
              </div>
              <span className="text-xs font-semibold text-[#241d2e]">RunRate</span>
            </div>
            <span className="text-[9px] text-neutral-500">Dashboard</span>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-4 gap-2">
              {[
                ["Current Runway", "4.8 months"],
                ["Monthly Expenses", "₦650,000"],
                ["Monthly Savings", "₦1,150,000"],
                ["Suggested Rate", "₦185,000"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-[#E8E3ED] bg-[#F7F5FA] p-2">
                  <p className="text-[8px] text-neutral-500">{label}</p>
                  <p className="mt-1 text-[10px] font-semibold text-[#6842A6]">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[1.7fr_1fr] gap-2 mt-3">
              <div className="rounded-lg border border-[#E8E3ED] bg-[#FFFFFF] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-semibold text-[#241d2e]">Runway Projection</span>
                  <span className="text-[8px] text-[#6842A6]">6M</span>
                </div>

                <div className="relative h-[120px]">
                  <div className="absolute inset-x-0 top-4 border-t border-white/5" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-white/5" />
                  <div className="absolute inset-x-0 bottom-4 border-t border-white/5" />

                  <div className="absolute left-[5%] right-[5%] top-[30%] h-[2px] bg-[#6842A6] rotate-[5deg]" />
                  <div className="absolute left-[5%] right-[5%] top-[52%] h-[2px] bg-[#6842A6] rotate-[-3deg] opacity-80" />

                  <div className="absolute left-[5%] top-[27%] w-2 h-2 rounded-full bg-[#6842A6]" />
                  <div className="absolute left-[28%] top-[36%] w-2 h-2 rounded-full bg-[#6842A6]" />
                  <div className="absolute left-[52%] top-[49%] w-2 h-2 rounded-full bg-[#6842A6]" />
                  <div className="absolute left-[76%] top-[42%] w-2 h-2 rounded-full bg-[#6842A6]" />
                  <div className="absolute right-[5%] top-[32%] w-2 h-2 rounded-full bg-[#6842A6]" />
                </div>
              </div>

              <div className="rounded-lg border border-[#E8E3ED] bg-[#FFFFFF] p-3">
                <p className="text-[9px] font-semibold text-[#241d2e] mb-2">
                  Runway at Different Rates
                </p>

                <div className="space-y-2">
                  {[
                    ["₦120,000", "5.1 months"],
                    ["₦150,000", "5.3 months"],
                    ["₦185,000", "5.4 months"],
                    ["₦220,000", "5.6 months"],
                    ["₦250,000", "5.8 months"],
                  ].map(([rate, runway], index) => (
                    <div
                      key={rate}
                      className="flex justify-between border-b border-white/5 pb-1 text-[8px]"
                    >
                      <span className={index === 2 ? "text-[#6842A6]" : "text-neutral-500"}>
                        {rate}
                      </span>
                      <span className={index === 2 ? "text-[#6842A6]" : "text-neutral-500"}>
                        {runway}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto mt-1 w-[94%] h-4 rounded-b-[50%] border-x border-b border-[#E8E3ED] bg-[#E8E3ED] shadow-2xl">
        <div className="absolute left-[40%] top-0 h-2 w-[20%] rounded-b-full bg-[#101010]" />
      </div>

      <div className="mx-auto mt-1 h-2 w-[72%] rounded-full bg-black/80 blur-md" />
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#241d2e] overflow-x-hidden">
      {/* Navigation */}
      <header className="homepage-header sticky top-0 z-50 border-b border-[#E8E3ED] bg-[#FFFFFF]/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <nav className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex items-end gap-1">
                <span className="w-2 h-5 rounded-sm bg-[#6842A6]" />
                <span className="w-2 h-8 rounded-sm bg-[#6842A6]" />
                <span className="w-2 h-11 rounded-sm bg-[#6842A6]" />
              </div>

              <div>
                <div className="text-xl font-bold tracking-tight">
                  Run<span className="text-[#6842A6]">Rate</span>
                </div>
                <p className="text-[8px] text-neutral-500">
                  Freelancer Pricing & Runway Tool
                </p>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm text-neutral-300">
              <a href="#features" className="hover:text-[#6842A6]">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-[#6842A6]">
                How It Works
              </a>
              <a href="#pricing" className="hover:text-[#6842A6]">
                Pricing
              </a>
              <a href="#features" className="hover:text-[#6842A6]">
                About
              </a>
              <a href="#contact" className="hover:text-[#6842A6]">
                Contact
              </a>
            </div>

            <div className="hidden sm:flex items-center gap-5">
              <Link
                href="/login"
                className="text-sm text-neutral-300 hover:text-[#241d2e]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#6842A6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#57348F]"
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
              <a href="#features" className="block text-neutral-300">
                Features
              </a>
              <a href="#how-it-works" className="block text-neutral-300">
                How It Works
              </a>
              <a href="#pricing" className="block text-neutral-300">
                Pricing
              </a>
              <Link href="/login" className="block text-neutral-300">
                Log in
              </Link>
              <Link
                href="/signup"
                className="block w-fit rounded-md bg-[#6842A6] px-5 py-3 font-semibold text-white"
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
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#6842A6]/30 bg-[#6842A6]/5 px-4 py-2 text-xs text-neutral-300">
                Built for freelancers · NGN & USD
                <span className="h-2 w-2 rounded-full bg-[#6842A6]" />
              </div>

              <h1 className="max-w-2xl text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.02]">
                Know what to{" "}
                <span className="text-[#6842A6]">charge.</span>
                <br />
                Understand what it does to your{" "}
                <span className="text-[#6842A6]">runway.</span>
              </h1>

              <p className="mt-7 max-w-xl text-base sm:text-lg leading-8 text-neutral-400">
                RunRate helps freelancers set the right rates, plan ahead and
                stay financially in control.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-md bg-[#6842A6] px-7 py-4 font-semibold text-white hover:bg-[#57348F]"
                >
                  Get Started Free
                  <span className="ml-3">→</span>
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-md border border-[#6842A6]/60 px-7 py-4 font-semibold text-[#241d2e] hover:bg-[#6842A6]/10"
                >
                  See How It Works
                  <span className="ml-3">▷</span>
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-5 max-w-lg">
                {[
                  ["♢", "100% Private", "Your data is yours."],
                  ["ϟ", "Instant Insights", "See results in real-time."],
                  ["⌁", "Smarter Decisions", "Price with confidence."],
                ].map(([icon, title, text]) => (
                  <div key={title}>
                    <div className="text-[#6842A6] text-xl">{icon}</div>
                    <p className="mt-2 text-xs font-semibold text-[#6842A6]">
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
                src="/runrate-hero.png"
                alt="Independent creative planning their work at a sunlit home studio desk"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#241d2e]/35 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl sm:bottom-7 sm:left-7 sm:right-7 sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6842A6]">Your financial workspace</p>
                <p className="mt-1 text-lg font-semibold text-[#241d2e] sm:text-xl">A clearer view of what your work makes possible.</p>
                <div className="mt-4 hidden sm:block"><LaptopPreview /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#6842A6]">
              BUILT FOR FREELANCERS
            </p>
            <p className="mt-4 text-neutral-400">
              Helping independent professionals price smarter and plan with
              greater financial clarity.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {[
              [
                "▣",
                "Price with Confidence",
                "Find the right rate for your skills, market and goals.",
              ],
              [
                "◎",
                "See Your Runway",
                "Understand how every rate impacts your financial runway.",
              ],
              [
                "◴",
                "Plan Your Future",
                "Set savings goals and plan for your financial future.",
              ],
              [
                "▥",
                "Make Smarter Decisions",
                "Use clear financial insights to make better choices.",
              ],
            ].map(([icon, title, text]) => (
              <div key={title} className="px-7 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#6842A6]/30 text-xl text-[#6842A6]">
                  {icon}
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-500">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20">
          <div className="rounded-2xl border border-[#E8E3ED] bg-[#F7F5FA] p-6 sm:p-10">
            <div className="grid lg:grid-cols-[0.8fr_1.7fr] gap-10 items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-[#6842A6]">
                  HOW IT WORKS
                </p>

                <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
                  Three steps to
                  <br />
                  financial clarity
                </h2>

                <div className="mt-10 space-y-7">
                  {[
                    [
                      "01",
                      "Enter Your Numbers",
                      "Add your monthly expenses, savings, income and project details.",
                    ],
                    [
                      "02",
                      "Explore Scenarios",
                      "Test different rates and see how they impact your runway.",
                    ],
                    [
                      "03",
                      "Price with Confidence",
                      "Choose the rate that supports your financial goals.",
                    ],
                  ].map(([number, title, text]) => (
                    <div key={number} className="flex gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#6842A6]/50 text-xs text-[#6842A6]">
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

              <div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#E8E3ED] bg-[#F8F6FA] p-6">
                    <p className="text-sm text-neutral-500">What if I charge</p>
                    <p className="mt-3 text-4xl font-semibold text-[#6842A6]">
                      ₦200,000
                    </p>
                    <p className="mt-2 text-sm text-neutral-400">
                      per project?
                    </p>

                    <div className="mt-8 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-xs text-emerald-400">
                        Projected Runway
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-emerald-400">
                        5.6 months
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#E8E3ED] bg-[#F8F6FA] p-5">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Runway Projection</p>
                      <span className="text-xs text-[#6842A6]">6M</span>
                    </div>
                    <div className="mt-4 h-48">
                      <RunwayGraph />
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ["Monthly Expenses", "₦650,000"],
                    ["Monthly Savings", "₦1,150,000"],
                    ["Savings Goal", "₦500,000"],
                    ["Tax Rate", "10%"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[#E8E3ED] bg-[#F8F6FA] p-4"
                    >
                      <p className="text-xs text-neutral-500">{label}</p>
                      <p className="mt-3 font-semibold">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="border-b border-[#E8E3ED]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
          <div className="rounded-2xl border border-[#6842A6]/20 bg-gradient-to-r from-[#F7F5FA] via-[#11100B] to-[#F7F5FA] p-8 sm:p-12">
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
                className="shrink-0 rounded-md bg-[#6842A6] px-7 py-4 font-semibold text-white hover:bg-[#57348F]"
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
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

            <div className="lg:col-span-2">
              <div className="flex items-center gap-2">
                <div className="flex items-end gap-1">
                  <span className="w-2 h-5 bg-[#6842A6]" />
                  <span className="w-2 h-8 bg-[#6842A6]" />
                  <span className="w-2 h-11 bg-[#6842A6]" />
                </div>
                <span className="text-2xl font-bold">
                  Run<span className="text-[#6842A6]">Rate</span>
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
              <h3 className="text-sm font-semibold text-[#241d2e]">Product</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-500">
                <p>Calculator</p>
                <p>Features</p>
                <p>Pricing</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241d2e]">Company</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-500">
                <p>About</p>
                <p>Blog</p>
                <p>Contact</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#241d2e]">Legal</h3>
              <div className="mt-4 space-y-3 text-sm text-neutral-500">
                <p>Privacy</p>
                <p>Terms</p>
                <p>Cookies</p>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </main>
  );
}
