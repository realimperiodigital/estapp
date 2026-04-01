"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let ativo = true;

    async function checkSession() {
      try {
        const session = await getCurrentSession();

        if (!ativo) return;

        if (session) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch {
        if (!ativo) return;
        router.replace("/login");
      }
    }

    checkSession();

    return () => {
      ativo = false;
    };
  }, [router]);

  return null;
}