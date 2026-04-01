"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LiteShell from "@/components/lite-shell";
import FormCliente from "@/components/form-cliente";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
};

type EditarClientePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function EditarClientePage({
  params,
}: EditarClientePageProps) {
  const router = useRouter();

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [clienteId, setClienteId] = useState("");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function resolverParamsECarregar() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        setClienteId(id);
        setErro("");
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
        }

        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", id)
          .eq("profissional_id", user.id)
          .single();

        if (error) {
          throw new Error(error.message || "Erro ao carregar cliente.");
        }

        setCliente(data as Cliente);
      } catch (error: any) {
        setErro(error?.message || "Erro ao carregar cliente.");
      } finally {
        setLoading(false);
      }
    }

    resolverParamsECarregar();
  }, [params, router]);

  async function handleUpdate(values: {
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
      nome: values.nome,
      telefone: values.telefone || null,
      email: values.email || null,
      observacoes: values.observacoes || null,
    };

    const { error } = await supabase
      .from("clientes")
      .update(payload)
      .eq("id", clienteId)
      .eq("profissional_id", user.id);

    if (error) {
      throw new Error(error.message || "Erro ao atualizar cliente.");
    }

    router.push(`/clientes/${clienteId}`);
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