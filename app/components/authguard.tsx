"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Props = {
  children: React.ReactNode;
};

const publicRoutes = ["/", "/login"];

export default function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (isPublicRoute) {
        if (mounted) setChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      if (mounted) setChecking(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!session && !isPublicRoute) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (checking && !publicRoutes.includes(pathname)) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Verificando acesso...</p>
      </main>
    );
  }

  return <>{children}</>;
}