"use client";

import { useEffect, useState } from "react";
import LiteShell from "@/components/lite-shell";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  clientes: number;
  servicos: number;
  agenda: number;
  reservas: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    clientes: 0,
    servicos: 0,
    agenda: 0,
    reservas: 0,
  });

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("Profissional");

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("Usuário não autenticado.");
        }

        const [profileRes, clientesRes, servicosRes, agendaRes, reservasRes] =
          await Promise.all([
            supabase
              .from("profiles")
              .select("nome")
              .eq("id", user.id)
              .single(),

            supabase
              .from("clientes")
              .select("id", { count: "exact", head: true })
              .eq("profissional_id", user.id),

            supabase
              .from("servicos")
              .select("id", { count: "exact", head: true })
              .eq("profissional_id", user.id),

            supabase
              .from("agenda_disponibilidade")
              .select("id", { count: "exact", head: true })
              .eq("profissional_id", user.id),

            supabase
              .from("reservas")
              .select("id", { count: "exact", head: true })
              .eq("profissional_id", user.id),
          ]);

        if (profileRes.data?.nome) {
          setNome(profileRes.data.nome);
        }

        setStats({
          clientes: clientesRes.count ?? 0,
          servicos: servicosRes.count ?? 0,
          agenda: agendaRes.count ?? 0,
          reservas: reservasRes.count ?? 0,
        });
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDashboard();
  }, []);

  return (
    <LiteShell title="Dashboard">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <section
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              marginBottom: "8px",
              color: "#111",
            }}
          >
            Olá, {nome}
          </h2>

          <p
            style={{
              color: "#555",
              fontSize: "15px",
            }}
          >
            Bem-vinda ao painel do EstApp Lite.
          </p>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Clientes
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              {loading ? "..." : stats.clientes}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Serviços
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              {loading ? "..." : stats.servicos}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Agenda
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              {loading ? "..." : stats.agenda}
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "10px",
              }}
            >
              Reservas
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                color: "#111",
              }}
            >
              {loading ? "..." : stats.reservas}
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              marginBottom: "12px",
              color: "#111",
            }}
          >
            Próximos passos do Lite
          </h3>

          <ul
            style={{
              paddingLeft: "18px",
              color: "#444",
              lineHeight: 1.8,
            }}
          >
            <li>Cadastrar clientes</li>
            <li>Cadastrar serviços</li>
            <li>Abrir horários na agenda</li>
            <li>Receber e controlar reservas</li>
          </ul>
        </section>
      </div>
    </LiteShell>
  );
}