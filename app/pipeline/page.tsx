"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type EtapaPipeline =
  | "lead_novo"
  | "contato_iniciado"
  | "qualificacao"
  | "apresentacao"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

type PipelineLead = {
  id: string;
  nome: string;
  empresa: string | null;
  telefone: string | null;
  cidade: string | null;
  origem: string | null;
  etapa: EtapaPipeline;
  valor_proposta: number;
  proximo_contato_em: string | null;
};

const ETAPAS = [
  { key: "lead_novo", label: "Lead novo" },
  { key: "contato_iniciado", label: "Contato iniciado" },
  { key: "qualificacao", label: "Qualificação" },
  { key: "apresentacao", label: "Apresentação" },
  { key: "proposta_enviada", label: "Proposta enviada" },
  { key: "negociacao", label: "Negociação" },
  { key: "fechado_ganho", label: "Fechado ganho" },
  { key: "fechado_perdido", label: "Fechado perdido" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function getStatusContato(data?: string | null) {
  if (!data) return null;

  const hoje = new Date();
  const contato = new Date(data);

  hoje.setHours(0, 0, 0, 0);
  contato.setHours(0, 0, 0, 0);

  if (contato < hoje)
    return { label: "Atrasado", cor: "text-red-400" };

  if (contato.getTime() === hoje.getTime())
    return { label: "Hoje", cor: "text-yellow-400" };

  return { label: "Agendado", cor: "text-green-400" };
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<PipelineLead[]>([]);

  async function loadLeads() {
    const { data } = await supabase
      .from("pipeline_leads")
      .select("*");

    setLeads(data || []);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, PipelineLead[]> = {};

    ETAPAS.forEach((e) => (g[e.key] = []));

    leads.forEach((l) => {
      g[l.etapa]?.push(l);
    });

    return g;
  }, [leads]);

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Pipeline Comercial
        </h1>

        <Link
          href="/pipeline/novo"
          className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold"
        >
          + Novo lead
        </Link>
      </div>

      <div className="grid grid-cols-8 gap-4">
        {ETAPAS.map((etapa) => (
          <div key={etapa.key} className="bg-white/5 p-3 rounded-xl">
            <h2 className="text-yellow-400 text-sm font-bold mb-3">
              {etapa.label}
            </h2>

            <div className="space-y-3">
              {grouped[etapa.key]?.map((lead) => {
                const statusContato =
                  getStatusContato(
                    lead.proximo_contato_em
                  );

                return (
                  <div
                    key={lead.id}
                    className="border border-white/10 p-3 rounded-xl"
                  >
                    <p className="font-bold">
                      {lead.nome}
                    </p>

                    <p className="text-xs text-white/60">
                      {lead.empresa}
                    </p>

                    <p className="text-xs">
                      💰 {formatMoney(lead.valor_proposta)}
                    </p>

                    {statusContato && (
                      <p
                        className={`text-xs font-bold ${statusContato.cor}`}
                      >
                        📅 {statusContato.label}
                      </p>
                    )}

                    <Link
                      href={`/pipeline/${lead.id}`}
                      className="block mt-2 text-xs border border-yellow-500 px-2 py-1 rounded text-yellow-400 text-center"
                    >
                      Abrir lead
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}