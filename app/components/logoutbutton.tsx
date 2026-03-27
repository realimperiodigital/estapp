"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20"
    >
      Sair
    </button>
  );
}