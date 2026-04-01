"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AppShell from "../../../components/appshell";

type Lancamento = {
  id: string;
  cliente_nome: string | null;
  descricao: string | null;
  plano: string | null;
  valor: number | string | null;
  status: string | null;
  forma_pagamento: string | null;
  created_at: string | null;
  updated_at: string | null;
  data_vencimento: string | null;
  vencimento: string | null;
  pago_em: string | null;
};

type Pagamento = {
  id: string;
  lancamento_id: string;
  valor: number | string | null;
  forma_pagamento: string | null;
  observacao: string | null;
  created_at: string | null;
};

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function formatDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatOnlyDate(value: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export default function FinanceiroDetalhePage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id || "");

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lancamento, setLancamento] = useState<Lancamento | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);

  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("pix");
  const [observacao, setObservacao] = useState("");

  async function loadData() {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const {
        data: lancamentoData,
        error: lancamentoError,
      } = await supabase
        .from("financeiro_lancamentos")
        .select("*")
        .eq("id", id)
        .single<Lancamento>();

      if (lancamentoError || !lancamentoData) {
        throw new Error("Lançamento não encontrado.");
      }

      const {
        data: pagamentosData,
        error: pagamentosError,
      } = await supabase
        .from("financeiro_pagamentos")
        .select("*")
        .eq("lancamento_id", id)
        .order("created_at", { ascending: false })
        .returns<Pagamento[]>();

      if (pagamentosError) {
        throw pagamentosError;
      }

      setLancamento(lancamentoData);
      setPagamentos(pagamentosData || []);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar o lançamento financeiro.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAccessAndLoad() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const email = user?.email?.trim().toLowerCase();

      if (!email) {
        router.replace("/login");
        return;
      }

      if (email !== "alessandra.myryam26@gmail.com") {
        router.replace("/dashboard");
        return;
      }

      setCheckingAccess(false);
      await loadData();
    }

    checkAccessAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, id]);

  const valorLancamento = useMemo(() => toNumber(lancamento?.valor), [lancamento]);

  const totalPago = useMemo(() => {
    return pagamentos.reduce((acc, item) => acc + toNumber(item.valor), 0);
  }, [pagamentos]);

  const saldoAtual = useMemo(() => {
    return Math.max(valorLancamento - totalPago, 0);
  }, [valorLancamento, totalPago]);

  async function handleRegistrarPagamento(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const valor = Number(valorPagamento.replace(",", "."));

    if (!valor || valor <= 0) {
      setError("Informe um valor de pagamento válido.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/financeiro/pagamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lancamento_id: id,
          valor,
          forma_pagamento: formaPagamento,
          observacao,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível registrar o pagamento.");
      }

      setSuccess("Pagamento registrado com sucesso.");
      setValorPagamento("");
      setFormaPagamento("pix");
      setObservacao("");

      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao registrar pagamento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExcluirPagamento(pagamentoId: string) {
    const ok = window.confirm("Deseja realmente excluir este pagamento?");

    if (!ok) return;

    setError("");
    setSuccess("");
    setDeletingId(pagamentoId);

    try {
      const response = await fetch(`/api/financeiro/pagamentos/${pagamentoId}`, {
        method: "DELETE",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Não foi possível excluir o pagamento.");
      }

      setSuccess("Pagamento excluído com sucesso.");
      await loadData();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao excluir pagamento.");
    } finally {
      setDeletingId("");
    }
  }

  if (checkingAccess) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p>Verificando acesso...</p>
      </main>
    );
  }

  return (
    <AppShell
      role="financeiro"
      title="Detalhe do Lançamento"
      subtitle="Visualize o título, acompanhe os pagamentos e registre novas baixas."
    >
      <div className="mb-6">
        <Link
          href="/financeiro"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition"
        >
          ← Voltar para Financeiro
        </Link>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-300">
          {success}
        </div>
      ) : null}

      {loading || !lancamento ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p>Carregando lançamento...</p>
        </div>
      ) : (
        <>
          <section className="grid gap-4 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-neutral-400">Cliente</p>
              <h2 className="mt-2 text-xl font-bold">
                {lancamento.cliente_nome || "Cliente não informado"}
              </h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-neutral-400">Valor do lançamento</p>
              <h2 className="mt-2 text-3xl font-bold">{formatCurrency(valorLancamento)}</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-neutral-400">Total pago</p>
              <h2 className="mt-2 text-3xl font-bold">{formatCurrency(totalPago)}</h2>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-neutral-400">Saldo atual</p>
              <h2 className="mt-2 text-3xl font-bold">{formatCurrency(saldoAtual)}</h2>
            </div>
          </section>

          <section className="mt-8 grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 xl:col-span-2">
              <h3 className="text-xl font-bold">Dados do Lançamento</h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Descrição</p>
                  <p className="mt-2 font-medium">{lancamento.descricao || "Sem descrição"}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Plano</p>
                  <p className="mt-2 font-medium">{lancamento.plano || "-"}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Status</p>
                  <p className="mt-2 font-medium">{lancamento.status || "sem_status"}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Forma de pagamento prevista</p>
                  <p className="mt-2 font-medium">{lancamento.forma_pagamento || "-"}</p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Vencimento</p>
                  <p className="mt-2 font-medium">
                    {formatOnlyDate(lancamento.data_vencimento || lancamento.vencimento)}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm text-neutral-400">Pago em</p>
                  <p className="mt-2 font-medium">{formatDate(lancamento.pago_em)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-xl font-bold">Registrar Pagamento</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Lance uma baixa financeira vinculada a este título.
              </p>

              <form onSubmit={handleRegistrarPagamento} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={saldoAtual > 0 ? saldoAtual : undefined}
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-amber-500"
                    placeholder="0,00"
                    disabled={saldoAtual <= 0 || saving}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Forma de pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-amber-500"
                    disabled={saldoAtual <= 0 || saving}
                  >
                    <option value="pix">Pix</option>
                    <option value="cartao">Cartão</option>
                    <option value="boleto">Boleto</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-neutral-300">Observação</label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    className="min-h-[100px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none focus:border-amber-500"
                    placeholder="Detalhes do pagamento"
                    disabled={saldoAtual <= 0 || saving}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
                  Saldo disponível para baixa: <strong>{formatCurrency(saldoAtual)}</strong>
                </div>

                <button
                  type="submit"
                  disabled={saldoAtual <= 0 || saving}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saldoAtual <= 0
                    ? "Título já quitado"
                    : saving
                    ? "Registrando..."
                    : "Registrar pagamento"}
                </button>
              </form>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-xl font-bold">Histórico de Pagamentos</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Todas as baixas vinculadas a este lançamento.
            </p>

            <div className="mt-6 space-y-4">
              {pagamentos.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-neutral-400">
                  Nenhum pagamento registrado ainda.
                </div>
              ) : (
                pagamentos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">
                          {item.forma_pagamento || "Forma não informada"}
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                          {item.observacao || "Sem observação"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(toNumber(item.valor))}</p>
                        <p className="mt-1 text-xs text-neutral-400">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleExcluirPagamento(item.id)}
                        disabled={deletingId === item.id}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                      >
                        {deletingId === item.id ? "Excluindo..." : "Excluir pagamento"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}