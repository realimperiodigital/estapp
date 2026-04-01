"use client";

import { useRouter } from "next/navigation";
import LiteShell from "@/components/lite-shell";
import FormCliente from "@/components/form-cliente";

export default function NovoClientePage() {
  const router = useRouter();

  async function handleCreate(values: {
    nome: string;
    telefone: string;
    email: string;
    observacoes: string;
  }) {
    const response = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao criar cliente.");
    }

    router.push("/clientes");
    router.refresh();
  }

  return (
    <LiteShell title="Novo cliente">
      <div
        style={{
          maxWidth: "720px",
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111",
            marginBottom: "8px",
          }}
        >
          Cadastrar novo cliente
        </h2>

        <p
          style={{
            color: "#666",
            marginBottom: "20px",
          }}
        >
          Preencha os dados básicos para salvar o cliente no EstApp Lite.
        </p>

        <FormCliente onSubmit={handleCreate} submitLabel="Salvar cliente" />
      </div>
    </LiteShell>
  );
}