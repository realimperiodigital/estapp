"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PipelineLead = {
  id: string;
  nome_lead?: string | null;
  nome?: string | null;
  empresa?: string | null;
  telefone?: string | null;
  email?: string | null;
  cidade?: string | null;
  segmento?: string | null;
  origem?: string | null;
  etapa?: string | null;
  valor_proposta?: number | string | null;
  proximo_contato?: string | null;
  observacoes?: string | null;
  status?: string | null;
};

const ETAPAS_PIPELINE = [
  { value: "lead_novo", label: "Lead novo" },
  { value: "contato_iniciado", label: "Contato iniciado" },
  { value: "qualificacao", label: "Qualificação" },
  { value: "apresentacao", label: "Apresentação" },
  { value: "proposta_enviada", label: "Proposta enviada" },
  { value: "negociacao", label: "Negociação" },
  { value: "fechado_ganho", label: "Fechado ganho" },
  { value: "fechado_perdido", label: "Fechado perdido" },
];

const STATUS_OPTIONS = [
  { value: "ativo", label: "Ativo" },
  { value: "ganho", label: "Ganho" },
  { value: "perdido", label: "Perdido" },
  { value: "atendido", label: "Atendido" },
  { value: "pausado", label: "Pausado" },
];

function formatarEtapa(etapa: string | null | undefined) {
  const encontrada = ETAPAS_PIPELINE.find((item) => item.value === etapa);
  return encontrada?.label || "-";
}

function formatarStatus(status: string | null | undefined) {
  const encontrado = STATUS_OPTIONS.find((item) => item.value === status);
  return encontrado?.label || "-";
}

function normalizarEtapaBanco(valor: string | null | undefined) {
  if (!valor) return "lead_novo";

  const etapaExiste = ETAPAS_PIPELINE.some((item) => item.value === valor);
  if (etapaExiste) return valor;

  const mapaLegado: Record<string, string> = {
    "Lead novo": "lead_novo",
    "Contato iniciado": "contato_iniciado",
    "Qualificação": "qualificacao",
    "Apresentação": "apresentacao",
    "Proposta enviada": "proposta_enviada",
    "Negociação": "negociacao",
    "Fechado ganho": "fechado_ganho",
    "Fechado perdido": "fechado_perdido",
    lead_novo: "lead_novo",
    contato_iniciado: "contato_iniciado",
    qualificacao: "qualificacao",
    apresentacao: "apresentacao",
    proposta_enviada: "proposta_enviada",
    negociacao: "negociacao",
    fechado_ganho: "fechado_ganho",
    fechado_perdido: "fechado_perdido",
  };

  return mapaLegado[valor] || "lead_novo";
}

function normalizarStatusBanco(valor: string | null | undefined) {
  if (!valor) return "ativo";

  const valorLimpo = String(valor).trim().toLowerCase();

  const mapaStatus: Record<string, string> = {
    ativo: "ativo",
    ganho: "ganho",
    perdido: "perdido",
    atendido: "atendido",
    pausado: "pausado",
  };

  return mapaStatus[valorLimpo] || "ativo";
}

export default function PipelineLeadPage() {
  const params = useParams();
  const router = useRouter();

  const leadId = useMemo(() => {
    const raw = params?.id;
    return Array.isArray(raw) ? raw[0] : raw || "";
  }, [params]);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [nomeLead, setNomeLead] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [segmento, setSegmento] = useState("");
  const [origem, setOrigem] = useState("");
  const [etapa, setEtapa] = useState("lead_novo");
  const [valorProposta, setValorProposta] = useState("");
  const [proximoContato, setProximoContato] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [status, setStatus] = useState("ativo");

  function formatarParaDatetimeLocal(valor: string | null | undefined) {
    if (!valor) return "";

    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return "";

    const offset = data.getTimezoneOffset();
    const local = new Date(data.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }

  async function carregarLead() {
    if (!leadId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("pipeline_leads")
      .select("*")
      .eq("id", leadId)
      .single();

    if (error) {
      console.error("Erro ao carregar lead:", error);
      alert(`Erro ao carregar lead: ${error.message}`);
      setLoading(false);
      return;
    }

    const lead = data as PipelineLead;

    setNomeLead(lead.nome_lead || lead.nome || "");
    setEmpresa(lead.empresa || "");
    setTelefone(lead.telefone || "");
    setEmail(lead.email || "");
    setCidade(lead.cidade || "");
    setSegmento(lead.segmento || "");
    setOrigem(lead.origem || "");
    setEtapa(normalizarEtapaBanco(lead.etapa));
    setValorProposta(
      lead.valor_proposta !== null && lead.valor_proposta !== undefined
        ? String(lead.valor_proposta)
        : ""
    );
    setProximoContato(formatarParaDatetimeLocal(lead.proximo_contato));
    setObservacoes(lead.observacoes || "");
    setStatus(normalizarStatusBanco(lead.status));

    setLoading(false);
  }

  useEffect(() => {
    carregarLead();
  }, [leadId]);

  async function salvarLead(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!leadId) {
      alert("Lead inválido.");
      return;
    }

    if (!nomeLead.trim()) {
      alert("Preencha o nome do lead.");
      return;
    }

    setSalvando(true);

    const payload = {
      nome_lead: nomeLead.trim(),
      empresa: empresa || null,
      telefone: telefone || null,
      email: email || null,
      cidade: cidade || null,
      segmento: segmento || null,
      origem: origem || null,
      etapa: etapa || "lead_novo",
      valor_proposta: valorProposta
        ? Number(String(valorProposta).replace(",", "."))
        : null,
      proximo_contato: proximoContato
        ? new Date(proximoContato).toISOString()
        : null,
      observacoes: observacoes || null,
      status: status || "ativo",
    };

    const { error } = await supabase
      .from("pipeline_leads")
      .update(payload)
      .eq("id", leadId);

    if (error) {
      console.error("Erro ao salvar lead:", error);
      alert(`Erro ao salvar lead: ${error.message}`);
      setSalvando(false);
      return;
    }

    alert("Lead atualizado com sucesso.");
    setSalvando(false);
    router.refresh();
  }

  async function marcarComoGanho() {
    if (!leadId) return;

    const { error } = await supabase
      .from("pipeline_leads")
      .update({
        etapa: "fechado_ganho",
        status: "ganho",
      })
      .eq("id", leadId);

    if (error) {
      console.error("Erro ao marcar como ganho:", error);
      alert(`Erro ao marcar como ganho: ${error.message}`);
      return;
    }

    setEtapa("fechado_ganho");
    setStatus("ganho");
    alert("Lead marcado como ganho.");
    router.refresh();
  }

  async function marcarComoPerdido() {
    if (!leadId) return;

    const { error } = await supabase
      .from("pipeline_leads")
      .update({
        etapa: "fechado_perdido",
        status: "perdido",
      })
      .eq("id", leadId);

    if (error) {
      console.error("Erro ao marcar como perdido:", error);
      alert(`Erro ao marcar como perdido: ${error.message}`);
      return;
    }

    setEtapa("fechado_perdido");
    setStatus("perdido");
    alert("Lead marcado como perdido.");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-6 text-white">
        <p>Carregando lead...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => router.push("/pipeline")}
          className="mb-4 rounded border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          Voltar ao Pipeline
        </button>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Lead</p>
            <p className="mt-2 text-2xl font-bold">{nomeLead || "-"}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Etapa</p>
            <p className="mt-2 text-2xl font-bold">{formatarEtapa(etapa)}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Status</p>
            <p className="mt-2 text-2xl font-bold">{formatarStatus(status)}</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-400">Valor proposta</p>
            <p className="mt-2 text-2xl font-bold">
              {valorProposta ? `R$ ${valorProposta}` : "-"}
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={marcarComoGanho}
            className="rounded-xl bg-green-500 px-5 py-3 font-semibold text-black hover:opacity-90"
          >
            Marcar como ganho
          </button>

          <button
            type="button"
            onClick={marcarComoPerdido}
            className="rounded-xl bg-red-500 px-5 py-3 font-semibold text-white hover:opacity-90"
          >
            Marcar como perdido
          </button>
        </div>

        <form
          onSubmit={salvarLead}
          className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Nome do lead *
              </label>
              <input
                type="text"
                value={nomeLead}
                onChange={(e) => setNomeLead(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Empresa
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Telefone
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Cidade
              </label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Segmento
              </label>
              <input
                type="text"
                value={segmento}
                onChange={(e) => setSegmento(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Origem
              </label>
              <input
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Etapa
              </label>
              <select
                value={etapa}
                onChange={(e) => setEtapa(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              >
                {ETAPAS_PIPELINE.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Valor proposta
              </label>
              <input
                type="number"
                step="0.01"
                value={valorProposta}
                onChange={(e) => setValorProposta(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Próximo contato
              </label>
              <input
                type="datetime-local"
                value={proximoContato}
                onChange={(e) => setProximoContato(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={6}
                className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-white outline-none"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-black hover:opacity-90 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/pipeline")}
              className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-zinc-200 hover:bg-zinc-900"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}