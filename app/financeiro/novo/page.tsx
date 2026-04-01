"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "../../../components/appshell";

export default function NovoLancamentoFinanceiroPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    plano: "Prime",
    valor: "",
    vencimento: "",
    status: "pendente",
  });

  function updateField(
    field: "descricao" | "plano" | "valor" | "vencimento" | "status",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.descricao.trim()) {
      alert("Informe a descrição.");
      return;
    }

    if (!form.valor.trim()) {
      alert("Informe o valor.");
      return;
    }

    if (!form.vencimento.trim()) {
      alert("Informe o vencimento.");
      return;
    }

    try {
      setLoading(true);

      const valorNumerico = Number(
        form.valor.replace(/\./g, "").replace(",", ".")
      );

      if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
        alert("Informe um valor válido.");
        return;
      }

      const { error } = await supabase.from("financeiro").insert([
        {
          descricao: form.descricao.trim(),
          plano: form.plano,
          valor: valorNumerico,
          vencimento: form.vencimento,
          status: form.status,
        },
      ]);

      if (error) {
        console.error(error);
        alert("Erro ao salvar lançamento financeiro.");
        return;
      }

      alert("Lançamento criado com sucesso.");
      router.push("/financeiro");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Erro interno ao criar lançamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Nova cobrança"
      subtitle="Cadastrar novo lançamento financeiro"
    >
      <div className="max-w-3xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-neutral-800 bg-neutral-900 p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm text-neutral-300">
                Descrição
              </label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => updateField("descricao", e.target.value)}
                placeholder="Ex.: Mensalidade EstApp Cliente João"
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Plano
              </label>
              <select
                value={form.plano}
                onChange={(e) => updateField("plano", e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-amber-500"
              >
                <option value="Prime">Prime</option>
                <option value="Elite">Elite</option>
                <option value="Pro">Pro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Valor
              </label>
              <input
                type="text"
                value={form.valor}
                onChange={(e) => updateField("valor", e.target.value)}
                placeholder="Ex.: 190,00"
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Vencimento
              </label>
              <input
                type="date"
                value={form.vencimento}
                onChange={(e) => updateField("vencimento", e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-amber-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-neutral-300">
                Status inicial
              </label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-black px-4 py-3 text-white outline-none transition focus:border-amber-500"
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar cobrança"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/financeiro")}
              className="rounded-lg border border-neutral-700 bg-black px-5 py-3 font-semibold text-white transition hover:border-neutral-500"
            >
              Voltar
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}