"use client";
import { signInWithGoogle, signUpWithEmail } from "../../lib/supabase/auth"

import { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;
    const terms = (form.elements.namedItem("terms") as HTMLInputElement).checked;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    const fullName = (form.elements.namedItem("fullName") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    try {
      const { session } = await signUpWithEmail(email, password, fullName);
      if (session) {
        router.push("/onboarding");
      } else {
        alert("Account created. Please check your email to confirm your account.");
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Sign up failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen min-h-[100dvh] w-full bg-[#050505] text-white">
      <div className="min-h-screen min-h-[100dvh] w-full px-4 sm:px-8 py-6 sm:py-8">

        <div className="w-full h-full min-h-[calc(100dvh-3rem)] border border-white/10 bg-[#0a0a0a] rounded-2xl flex flex-col">

          <header className="w-full px-5 sm:px-10 py-5 sm:py-7">
            <a href="/" className="inline-flex items-center gap-2">
              <div className="flex items-end gap-1">
                <span className="w-2 h-5 rounded-sm bg-[#D4AF37]" />
                <span className="w-2 h-7 rounded-sm bg-[#D4AF37]" />
                <span className="w-2 h-9 rounded-sm bg-[#D4AF37]" />
              </div>

              <span className="text-lg font-bold">
                Run<span className="text-[#D4AF37]">Rate</span>
              </span>
            </a>
          </header>

          <div className="flex-1 w-full px-5 sm:px-10 pb-8 overflow-y-auto">

            <div className="w-full max-w-3xl mx-auto">

              <h1 className="text-3xl sm:text-4xl font-bold">
                Create your account
              </h1>

              <p className="mt-2 text-base sm:text-lg text-neutral-500">
                Start your journey with RunRate.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                <div>
                  <label className="block text-base mb-2">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-base mb-2">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-base mb-2">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Create a password"
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-base mb-2">Confirm Password</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Confirm your password"
                    className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <label className="flex items-start gap-3 text-sm sm:text-base text-neutral-400">
                  <input
                    name="terms"
                    type="checkbox"
                    className="mt-0.5 accent-[#D4AF37]"
                  />
                  <span>
                    I agree to the Terms of Service and Privacy Policy
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 font-semibold text-black"
                >
                  Create Account
                </button>

              </form>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs text-neutral-600">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <button
                type="button"
                onClick={async () => { try { await signInWithGoogle() } catch (error) { console.error(error); alert("Google sign-in failed. Please try again.") } }}
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base font-medium"
              >
                Continue with Google
              </button>

              <p className="text-center text-base text-neutral-500 mt-6">
                Already have an account?{" "}
                <a href="/login" className="text-[#D4AF37]">
                  Log in
                </a>
              </p>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
