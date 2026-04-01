"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  nome: string;
};

type Representante = {
  id: string;
  nome: string;
};

type PipelineLeadBruto = {
  id: string;
  [key: string]: any;
};

type PipelineLead = {
  id: string;
  nome_exibicao: string;
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

export default function NovoAgendamento() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [pipelineLeads, setPipelineLeads] = useState<PipelineLead[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [representanteId, setRepresentanteId] = useState("");
  const [pipelineId, setPipelineId] = useState("");
  const [dataAgendada, setDataAgendada] = useState("");
  const [tipoAtendimento, setTipoAtendimento] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("agendado");
  const [salvando, setSalvando] = useState(false);

  async function carregarDados() {
    const [clientesResp, representantesResp, pipelineResp] = await Promise.all([
      supabase
        .from("clientes")
        .select("id, nome")
        .order("nome", { ascending: true }),

      supabase
        .from("representantes")
        .select("id, nome")
        .order("nome", { ascending: true }),

      supabase
        .from("pipeline_leads")
        .select("*"),
    ]);

    if (clientesResp.error) {
      console.error("Erro ao carregar clientes:", clientesResp.error);
      setClientes([]);
    } else {
      setClientes((clientesResp.data as Cliente[]) || []);
    }

    if (representantesResp.error) {
      console.error("Erro ao carregar representantes:", representantesResp.error);
      setRepresentantes([]);
    } else {
      setRepresentantes((representantesResp.data as Representante[]) || []);
    }

    if (pipelineResp.error) {
      console.error("Erro ao carregar pipeline:", pipelineResp.error);
      setPipelineLeads([]);
    } else {
      const leadsBrutos = (pipelineResp.data as PipelineLeadBruto[]) || [];

      const leadsFormatados: PipelineLead[] = leadsBrutos.map((lead) => ({
        id: lead.id,
        nome_exibicao: montarNomeLead(lead),
      }));

      setPipelineLeads(leadsFormatados);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!clienteId || !representanteId || !dataAgendada) {
      alert("Preencha cliente, representante e data.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase.from("agenda_comercial").insert({
      cliente_id: Number(clienteId),
      representante_id: representanteId,
      pipeline_id: pipelineId || null,
      data_agendada: dataAgendada,
      tipo_atendimento: tipoAtendimento || null,
      observacoes: observacoes || null,
      status,
    });

    if (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert(`Erro ao salvar agendamento: ${error.message}`);
      setSalvando(false);
      return;
    }

    router.push("/agenda");
    router.refresh();
  }

  return (
    <div className="max-w-2xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Novo Agendamento</h1>

      <form onSubmit={salvar} className="space-y-4">
        <div>
          <label className="mb-1 block font-medium">Cliente</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={String(cliente.id)}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Representante</label>
          <select
            value={representanteId}
            onChange={(e) => setRepresentanteId(e.target.value)}
            className="w-full rounded border p-2"
            required
          >
            <option value="">Selecione o representante</option>
            {representantes.map((representante) => (
              <option key={representante.id} value={representante.id}>
                {representante.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Lead do Pipeline</label>
          <select
            value={pipelineId}
            onChange={(e) => setPipelineId(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="">Sem vínculo com pipeline</option>
            {pipelineLeads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.nome_exibicao}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Data e hora</label>
          <input
            type="datetime-local"
            value={dataAgendada}
            onChange={(e) => setDataAgendada(e.target.value)}
            className="w-full rounded border p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Tipo de atendimento</label>
          <input
            type="text"
            value={tipoAtendimento}
            onChange={(e) => setTipoAtendimento(e.target.value)}
            className="w-full rounded border p-2"
            placeholder="Ex.: reunião comercial, retorno, apresentação"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded border p-2"
          >
            <option value="agendado">Agendado</option>
            <option value="confirmado">Confirmado</option>
            <option value="realizado">Realizado</option>
            <option value="cancelado">Cancelado</option>
            <option value="reagendado">Reagendado</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Observações</label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full rounded border p-2"
            rows={4}
            placeholder="Detalhes do atendimento"
          />
        </div>

        <button
          type="submit"
          disabled={salvando}
          className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar Agendamento"}
        </button>
      </form>
    </div>
  );
}