"use client"

import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { createClient } from "@/lib/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (!error) {
      await mutate('runrate:authenticated-profile', undefined, { revalidate: false })
      router.replace("/")
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl border border-[#54264F] px-4 py-3 text-sm font-semibold text-[#54264F] sm:w-auto"
    >
      Log out
    </button>
  )
}
