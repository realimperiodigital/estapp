"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

type LiteHeaderProps = {
  title: string;
};

export default function LiteHeader({ title }: LiteHeaderProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível sair.");
    }
  }

  return (
    <header
      style={{
        height: "72px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#111",
        }}
      >
        {title}
      </h1>

      <button
        onClick={handleLogout}
        style={{
          border: "none",
          borderRadius: "10px",
          background: "#111",
          color: "#fff",
          padding: "10px 16px",
          fontWeight: 700,
        }}
      >
        Sair
      </button>
    </header>
  );
}