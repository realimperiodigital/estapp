"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();

        if (session) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      }
    }

    checkSession();
  }, [router]);

  return null;
}