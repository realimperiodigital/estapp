"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type AgendaRow = {
  id: number;
  data_agendada: string;
  tipo_atendimento: string | null;
  observacoes: string | null;
  status: string | null;
  cliente_id: number | null;
  representante_id: string | null;
  pipeline_id: string | null;
};

type AgendaItem = {
  id: number;
  data_agendada: string;
  tipo_atendimento: string | null;
  observacoes: string | null;
  status: string | null;
  cliente_nome: string;
  representante_nome: string;
  pipeline_nome: string;
  pipeline_id: string | null;
};

type PipelineLeadBruto = {
  id: string;
  [key: string]: any;
};

function montarNomeLead(lead: PipelineLeadBruto): string {
  return (
    lead.nome_lead ||
    lead.nome ||
    lead.nome_cliente ||
    lead.empresa ||
    lead.titulo ||
    lead.razao_social ||
    lead.fantasia ||
    `Lead ${String(lead.id).slice(0, 8)}`
  );
}

export default function AgendaPage() {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function atualizarStatus(
    id: number,
    novoStatus: string,
    pipelineId: string | null
  ) {
    const { error } = await supabase
      .from("agenda_comercial")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status da agenda");
      return;
    }

    if (novoStatus === "realizado" && pipelineId) {
      const { error: pipelineError } = await supabase
        .from("pipeline_leads")
        .update({ status: "atendido" })
        .eq("id", pipelineId);

      if (pipelineError) {
        console.error("Erro ao atualizar pipeline:", pipelineError);
      }
    }

    carregarAgenda();
  }

  async function carregarAgenda() {
    setLoading(true);

    const agendaResp = await supabase
      .from("agenda_comercial")
      .select(
        "id, data_agendada, tipo_atendimento, observacoes, status, cliente_id, representante_id, pipeline_id"
      )
      .order("data_agendada", { ascending: true });

    if (agendaResp.error) {
      console.error("Erro ao carregar agenda:", agendaResp.error);
      setLoading(false);
      return;
    }

    const agendaRows = (agendaResp.data as AgendaRow[]) || [];

    const [clientesResp, representantesResp, pipelineResp] = await Promise.all([
      supabase.from("clientes").select("id, nome"),
      supabase.from("representantes").select("id, nome"),
      supabase.from("pipeline_leads").select("*"),
    ]);

    const clientesMap = new Map<number, string>();
    (clientesResp.data || []).forEach((c: any) => {
      clientesMap.set(c.id, c.nome);
    });

    const representantesMap = new Map<string, string>();
    (representantesResp.data || []).forEach((r: any) => {
      representantesMap.set(r.id, r.nome);
    });

    const pipelineMap = new Map<string, string>();
    ((pipelineResp.data as PipelineLeadBruto[]) || []).forEach((p) => {
      pipelineMap.set(p.id, montarNomeLead(p));
    });

    const agendaFormatada: AgendaItem[] = agendaRows.map((item) => ({
      id: item.id,
      data_agendada: item.data_agendada,
      tipo_atendimento: item.tipo_atendimento,
      observacoes: item.observacoes,
      status: item.status,
      pipeline_id: item.pipeline_id,
      cliente_nome: clientesMap.get(item.cliente_id || 0) || "-",
      representante_nome: representantesMap.get(item.representante_id || "") || "-",
      pipeline_nome: pipelineMap.get(item.pipeline_id || "") || "-",
    }));

    setAgenda(agendaFormatada);
    setLoading(false);
  }

  useEffect(() => {
    carregarAgenda();
  }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between">
        <h1 className="text-2xl font-bold">Agenda Comercial</h1>

        <a
          href="/agenda/novo"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Novo Agendamento
        </a>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Data</th>
              <th className="border p-2">Cliente</th>
              <th className="border p-2">Representante</th>
              <th className="border p-2">Lead</th>
              <th className="border p-2">Tipo</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Ações</th>
            </tr>
          </thead>

          <tbody>
            {agenda.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">
                  {new Date(item.data_agendada).toLocaleString("pt-BR")}
                </td>

                <td className="border p-2">{item.cliente_nome}</td>
                <td className="border p-2">{item.representante_nome}</td>
                <td className="border p-2">{item.pipeline_nome}</td>
                <td className="border p-2">{item.tipo_atendimento}</td>
                <td className="border p-2">{item.status}</td>

                <td className="border p-2 space-x-2">
                  <button
                    onClick={() =>
                      atualizarStatus(item.id, "confirmado", item.pipeline_id)
                    }
                    className="rounded bg-blue-600 px-2 py-1 text-white"
                  >
                    Confirmar
                  </button>

                  <button
                    onClick={() =>
                      atualizarStatus(item.id, "realizado", item.pipeline_id)
                    }
                    className="rounded bg-green-600 px-2 py-1 text-white"
                  >
                    Realizado
                  </button>

                  <button
                    onClick={() =>
                      atualizarStatus(item.id, "cancelado", item.pipeline_id)
                    }
                    className="rounded bg-red-600 px-2 py-1 text-white"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}