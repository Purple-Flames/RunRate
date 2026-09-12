"use client"

import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl border border-[#D4AF37] px-4 py-3 text-sm font-semibold text-[#D4AF37] sm:w-auto"
    >
      Log out
    </button>
  )
}
