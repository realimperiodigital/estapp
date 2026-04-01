"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LiteShell from "@/components/lite-shell";
import FormCliente from "@/components/form-cliente";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
};

type EditarClientePageProps = {
  params: {
    id: string;
  };
};

export default function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const router = useRouter();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarCliente() {
      try {
        setErro("");
        setLoading(true);

        const response = await fetch(`/api/clientes/${params.id}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Erro ao carregar cliente.");
        }

        setCliente(data);
      } catch (error: any) {
        setErro(error?.message || "Erro ao carregar cliente.");
      } finally {
        setLoading(false);
      }
    }

    carregarCliente();
  }, [params.id]);

  async function handleUpdate(values: {
    nome: string;
    telefone: string;
    email: string;
    observacoes: string;
  }) {
    const response = await fetch(`/api/clientes/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "Erro ao atualizar cliente.");
    }

    router.push(`/clientes/${params.id}`);
    router.refresh();
  }

  return (
    <LiteShell title="Editar cliente">
      <div
        style={{
          maxWidth: "720px",
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        {loading ? (
          <p>Carregando cliente...</p>
        ) : erro ? (
          <div
            style={{
              background: "#ffe6e6",
              color: "#b30000",
              padding: "12px",
              borderRadius: "10px",
            }}
          >
            {erro}
          </div>
        ) : !cliente ? (
          <p>Cliente não encontrado.</p>
        ) : (
          <>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "8px",
              }}
            >
              Editar cliente
            </h2>

            <p
              style={{
                color: "#666",
                marginBottom: "20px",
              }}
            >
              Atualize os dados do cliente selecionado.
            </p>

            <FormCliente
              initialValues={{
                nome: cliente.nome || "",
                telefone: cliente.telefone || "",
                email: cliente.email || "",
                observacoes: cliente.observacoes || "",
              }}
              onSubmit={handleUpdate}
              submitLabel="Salvar alterações"
            />
          </>
        )}
      </div>
    </LiteShell>
  );
}