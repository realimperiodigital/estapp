"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AppShell from "../../components/appshell";

type FinanceiroItem = {
  id: string;
  valor: number | string | null;
  status: string | null;
};

type DashboardData = {
  totalRecebido: number;
  totalPendente: number;
  totalVencido: number;
  totalRegistros: number;
};

export default function MasterDashboard() {
  const [loading, setLoading] = useState(true);

  const [dados, setDados] = useState<DashboardData>({
    totalRecebido: 0,
    totalPendente: 0,
    totalVencido: 0,
    totalRegistros: 0,
  });

  async function carregarDashboard() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("financeiro")
        .select("*");

      if (error) {
        console.error("Erro Supabase:", error);
        return;
      }

      if (!data) return;

      let recebido = 0;
      let pendente = 0;
      let vencido = 0;

      data.forEach((item: FinanceiroItem) => {
        const valor = Number(item.valor) || 0;

        if (item.status === "pago") {
          recebido += valor;
        }

        if (item.status === "pendente") {
          pendente += valor;
        }

        if (item.status === "vencido") {
          vencido += valor;
        }
      });

      setDados({
        totalRecebido: recebido,
        totalPendente: pendente,
        totalVencido: vencido,
        totalRegistros: data.length,
      });
    } catch (err) {
      console.error("Erro geral:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDashboard();
  }, []);

  return (
    <AppShell
      title="Dashboard Master"
      subtitle="Visão geral do sistema"
    >
      {loading ? (
        <div className="text-neutral-400">
          Carregando dados...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

          <Card
            titulo="Total Recebido"
            valor={dados.totalRecebido}
            cor="green"
          />

          <Card
            titulo="Total Pendente"
            valor={dados.totalPendente}
            cor="yellow"
          />

          <Card
            titulo="Total Vencido"
            valor={dados.totalVencido}
            cor="red"
          />

          <Card
            titulo="Registros"
            valor={dados.totalRegistros}
            cor="blue"
          />

        </div>
      )}
    </AppShell>
  );
}

function Card({
  titulo,
  valor,
  cor,
}: {
  titulo: string;
  valor: number;
  cor: "green" | "yellow" | "red" | "blue";
}) {
  const cores = {
    green: "text-green-400",
    yellow: "text-yellow-400",
    red: "text-red-400",
    blue: "text-blue-400",
  };

  const formatado =
    titulo === "Registros"
      ? valor.toString()
      : valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">

      <p className="text-neutral-400 text-sm">
        {titulo}
      </p>

      <h2 className={`text-2xl font-bold mt-2 ${cores[cor]}`}>
        {formatado}
      </h2>

    </div>
  );
}