"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LiteShell from "@/components/lite-shell";
import { supabase } from "@/lib/supabase";

type DashboardStats = {
  clientes: number;
  servicos: number;
  agenda: number;
  reservas: number;
};

export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    clientes: 0,
    servicos: 0,
    agenda: 0,
    reservas: 0,
  });

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("Profissional");

  useEffect(() => {
    let ativo = true;

    async function carregarDashboard() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/login");
          return;
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

        if (!ativo) return;

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
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarDashboard();

    return () => {
      ativo = false;
    };
  }, [router]);

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
          {[
            { label: "Clientes", value: stats.clientes },
            { label: "Serviços", value: stats.servicos },
            { label: "Agenda", value: stats.agenda },
            { label: "Reservas", value: stats.reservas },
          ].map((item) => (
            <div
              key={item.label}
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
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                {loading ? "..." : item.value}
              </div>
            </div>
          ))}
        </section>
      </div>
    </LiteShell>
  );
}