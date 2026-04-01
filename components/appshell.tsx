"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AppShell({
  title,
  subtitle,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  const menu = [
    {
      label: "Dashboard",
      href: "/master",
    },
    {
      label: "Clientes",
      href: "/clientes",
    },
    {
      label: "Agenda",
      href: "/agenda",
    },
    {
      label: "Pipeline",
      href: "/pipeline",
    },
    {
      label: "Financeiro",
      href: "/financeiro",
    },
    {
      label: "Meu App",
      href: "/meu-app",
    },
  ];

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}

      <aside className="w-64 border-r border-neutral-800 bg-black">

        <div className="p-6 border-b border-neutral-800">
          <h1 className="text-lg font-bold text-white">
            EstApp
          </h1>

          <p className="text-xs text-neutral-400">
            Painel administrativo
          </p>
        </div>

        <nav className="p-4 space-y-2">

          {menu.map((item) => {

            const ativo =
              pathname === item.href;

            return (

              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm transition ${
                  ativo
                    ? "bg-amber-500 text-black font-semibold"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                {item.label}
              </Link>

            );

          })}

        </nav>

      </aside>

      {/* CONTEÚDO */}

      <main className="flex-1">

        <header className="border-b border-neutral-800 bg-neutral-900 px-8 py-5">

          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          {subtitle && (

            <p className="text-sm text-neutral-400">
              {subtitle}
            </p>

          )}

        </header>

        <div className="p-8">

          {children}

        </div>

      </main>

    </div>
  );
}