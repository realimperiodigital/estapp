"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FormData = {
  nome: string;
  empresa: string;
  telefone: string;
  email: string;
  cidade: string;
  segmento: string;
  origem: string;
  valor_proposta: string;
  observacoes: string;
  proximo_contato_em: string;
};

const initialForm: FormData = {
  nome: "",
  empresa: "",
  telefone: "",
  email: "",
  cidade: "",
  segmento: "",
  origem: "",
  valor_proposta: "",
  observacoes: "",
  proximo_contato_em: "",
};

export default function NovoLeadPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(initialForm);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("Preencha o nome do lead.");
      return;
    }

    setSaving(true);

    const payload = {
      nome: form.nome.trim(),
      empresa: form.empresa.trim() || null,
      telefone: form.telefone.trim() || null,
      email: form.email.trim() || null,
      cidade: form.cidade.trim() || null,
      segmento: form.segmento.trim() || null,
      origem: form.origem.trim() || null,
      etapa: "lead_novo",
      status: "ativo",
      valor_proposta: Number(form.valor_proposta || 0),
      observacoes: form.observacoes.trim() || null,
      proximo_contato_em: form.proximo_contato_em
        ? new Date(form.proximo_contato_em).toISOString()
        : null,
      ultima_interacao_em: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("pipeline_leads")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.error("Erro ao criar lead:", error);
      alert(`Erro ao criar lead: ${error.message}`);
      setSaving(false);
      return;
    }

    router.push(`/pipeline/${data.id}`);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Novo Lead</h1>
            <p className="mt-2 text-sm text-white/70">
              Cadastre uma nova oportunidade comercial no pipeline do EstApp.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/pipeline"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Voltar
            </Link>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Nome do lead *</label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-yellow-500"
                placeholder="Ex.: Maria Oliveira"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Empresa</label>
              <input
                type="text"
                value={form.empresa}
                onChange={(e) => updateField("empresa", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: Clínica Bella Forma"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={(e) => updateField("telefone", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: (11) 99999-9999"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: contato@empresa.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Cidade</label>
              <input
                type="text"
                value={form.cidade}
                onChange={(e) => updateField("cidade", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: João Pessoa"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Segmento</label>
              <input
                type="text"
                value={form.segmento}
                onChange={(e) => updateField("segmento", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: Estética"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Origem do lead</label>
              <input
                type="text"
                value={form.origem}
                onChange={(e) => updateField("origem", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: WhatsApp / Instagram / Indicação"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Valor da proposta</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.valor_proposta}
                onChange={(e) => updateField("valor_proposta", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: 997.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Próximo contato</label>
              <input
                type="datetime-local"
                value={form.proximo_contato_em}
                onChange={(e) => updateField("proximo_contato_em", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Observações</label>
              <textarea
                rows={5}
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-yellow-500"
                placeholder="Ex.: Lead interessado em plano Pró com instalação embutida..."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-yellow-500 px-5 py-3 text-sm font-bold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar lead"}
            </button>

            <Link
              href="/pipeline"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}