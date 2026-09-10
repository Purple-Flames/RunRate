"use client";

import { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"
import { signInWithGoogle } from "../../lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user == null) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    router.push(profile ? "/dashboard" : "/onboarding");
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error(error)
      alert("Google sign-in failed. Please try again.")
    }
  }

  return (
    <main className="min-h-screen min-h-[100dvh] w-full bg-[#050505] text-white p-0">
      <div className="w-full max-w-none">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="flex items-end gap-1">
            <span className="w-2 h-5 rounded-sm bg-[#D4AF37]" />
            <span className="w-2 h-8 rounded-sm bg-[#D4AF37]" />
            <span className="w-2 h-11 rounded-sm bg-[#D4AF37]" />
          </div>
          <span className="text-lg font-bold">
            Run<span className="text-[#D4AF37]">Rate</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-base sm:text-lg text-neutral-500">
            Log in to your account.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-base mb-2">
                Email Address
              </label>

              <input
                type="email" name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm">Password</label>

                <button
                  type="button"
                  className="text-sm text-[#D4AF37]"
                >
                  Forgot password?
                </button>
              </div>

              <input
                type="password" name="password"
                required
                placeholder="Enter your password"
                className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 font-semibold text-black hover:bg-[#e1bd43]"
            >
              Log In
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-neutral-600">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full rounded-lg border border-white/10 bg-[#111111] px-4 py-3 text-base font-medium hover:bg-white/5"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-neutral-500">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[#D4AF37] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
