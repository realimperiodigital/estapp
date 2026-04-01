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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarClientes() {
    try {
      setErro("");
      setLoading(true);

      const response = await fetch("/api/clientes", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao carregar clientes.");
      }

      setClientes(data);
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  }

  async function excluirCliente(id: string) {
    const confirmar = window.confirm("Deseja realmente excluir este cliente?");
    if (!confirmar) return;

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao excluir cliente.");
      }

      await carregarClientes();
    } catch (error: any) {
      alert(error?.message || "Erro ao excluir cliente.");
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  return (
    <LiteShell title="Clientes">
      <div style={{ display: "grid", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              Cadastro de clientes
            </h2>
            <p style={{ color: "#666", marginTop: "4px" }}>
              Gerencie os clientes da sua agenda.
            </p>
          </div>

          <Link
            href="/clientes/novo"
            style={{
              display: "inline-block",
              padding: "12px 16px",
              borderRadius: "10px",
              background: "#111",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            Novo cliente
          </Link>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          {loading ? (
            <p>Carregando clientes...</p>
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
          ) : clientes.length === 0 ? (
            <p style={{ color: "#666" }}>Nenhum cliente cadastrado ainda.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  style={{
                    border: "1px solid #ececec",
                    borderRadius: "14px",
                    padding: "16px",
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#111",
                      }}
                    >
                      {cliente.nome}
                    </h3>
                    <p style={{ color: "#666", marginTop: "4px" }}>
                      {cliente.telefone || "Sem telefone"}{" "}
                      {cliente.email ? `• ${cliente.email}` : ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Link
                      href={`/clientes/${cliente.id}`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #111",
                        color: "#111",
                        fontWeight: 600,
                      }}
                    >
                      Ver
                    </Link>

                    <Link
                      href={`/clientes/${cliente.id}/editar`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #111",
                        color: "#111",
                        fontWeight: 600,
                      }}
                    >
                      Editar
                    </Link>

                    <button
                      onClick={() => excluirCliente(cliente.id)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #b30000",
                        color: "#b30000",
                        background: "transparent",
                        fontWeight: 600,
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </LiteShell>
  );
}