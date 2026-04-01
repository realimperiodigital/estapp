"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/servicos", label: "Serviços" },
  { href: "/agenda", label: "Agenda" },
];

export default function LiteSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "220px",
        minHeight: "calc(100vh - 72px)",
        background: "#111",
        color: "#fff",
        padding: "20px 16px",
      }}
    >
      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        EstApp Lite
      </div>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "12px 14px",
                borderRadius: "10px",
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#111111" : "#ffffff",
                fontWeight: isActive ? 700 : 500,
                border: isActive ? "1px solid #ffffff" : "1px solid #333",
                transition: "0.2s",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}