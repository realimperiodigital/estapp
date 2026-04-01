"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Clientes",
    href: "/clientes",
  },
  {
    title: "Agenda",
    href: "/agenda",
  },
  {
    title: "Pipeline",
    href: "/pipeline",
  },
  {
    title: "Financeiro",
    href: "/financeiro",
  },
  {
    title: "Meu App",
    href: "/meu-app",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black border-r border-zinc-800 min-h-screen flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">
          EstApp
        </h1>

        <p className="text-xs text-zinc-400 mt-1">
          Painel administrativo
        </p>
      </div>

      {/* MENU */}
      <nav className="flex-1 p-4 space-y-2">

        {menuItems.map((item) => {

          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                block px-4 py-3 rounded-lg text-sm font-medium transition
                ${
                  isActive
                    ? "bg-amber-500 text-black"
                    : "text-zinc-300 hover:bg-zinc-900"
                }
              `}
            >
              {item.title}
            </Link>
          );
        })}

      </nav>

      {/* RODAPÉ */}
      <div className="p-4 border-t border-zinc-800 text-xs text-zinc-500">

        Sistema EstApp  
        v1.0 Estrutural

      </div>

    </aside>
  );
}