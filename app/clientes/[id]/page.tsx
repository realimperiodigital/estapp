"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LiteShell from "@/components/lite-shell";

type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  observacoes: string | null;
  created_at: string;
};

type ClientePageProps = {
  params: {
    id: string;
  };
};

export default function ClienteDetalhePage({ params }: ClientePageProps) {
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

  return (
    <LiteShell title="Detalhes do cliente">
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
                fontSize: "26px",
                fontWeight: 700,
                color: "#111",
                marginBottom: "18px",
              }}
            >
              {cliente.nome}
            </h2>

            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <strong>Telefone:</strong>{" "}
                <span>{cliente.telefone || "Não informado"}</span>
              </div>

              <div>
                <strong>E-mail:</strong>{" "}
                <span>{cliente.email || "Não informado"}</span>
              </div>

              <div>
                <strong>Observações:</strong>
                <div
                  style={{
                    marginTop: "8px",
                    padding: "14px",
                    borderRadius: "12px",
                    background: "#f7f7f7",
                    color: "#333",
                    minHeight: "80px",
                  }}
                >
                  {cliente.observacoes || "Sem observações."}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "24px",
              }}
            >
              <Link
                href={`/clientes/${cliente.id}/editar`}
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#111",
                  color: "#fff",
                  fontWeight: 700,
                }}
              >
                Editar cliente
              </Link>

              <Link
                href="/clientes"
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid #111",
                  color: "#111",
                  fontWeight: 700,
                }}
              >
                Voltar
              </Link>
            </div>
          </>
        )}
      </div>
    </LiteShell>
  );
}