"use client";

import { useRouter } from "next/navigation";
import LiteShell from "@/components/lite-shell";
import FormCliente from "@/components/form-cliente";
import { supabase } from "@/lib/supabase";

export default function NovoClientePage() {
  const router = useRouter();

  async function handleCreate(values: {
    nome: string;
    telefone: string;
    email: string;
    observacoes: string;
  }) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.replace("/login");
      throw new Error("Sessão não encontrada. Faça login novamente.");
    }

    const payload = {
      profissional_id: user.id,
      nome: values.nome,
      telefone: values.telefone || null,
      email: values.email || null,
      observacoes: values.observacoes || null,
    };

    const { error } = await supabase
      .from("clientes")
      .insert(payload);

    if (error) {
      throw new Error(error.message || "Erro ao criar cliente.");
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

        <FormCliente
          onSubmit={handleCreate}
          submitLabel="Salvar cliente"
        />
      </div>
    </LiteShell>
  );
}