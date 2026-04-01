"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Wrench, RefreshCw } from "lucide-react";

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_minutos: number;
  preco: number;
  ativo: boolean;
  created_at?: string;
};

type FormDataState = {
  nome: string;
  descricao: string;
  duracao_minutos: string;
  preco: string;
  ativo: boolean;
};

const FORM_INICIAL: FormDataState = {
  nome: "",
  descricao: "",
  duracao_minutos: "60",
  preco: "",
  ativo: true,
};

async function parseResponseSafely(response: Response) {
  const text = await response.text();

  if (!text || !text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Resposta inválida da API: ${text.slice(0, 200)}`);
  }
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [servicoEditandoId, setServicoEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormDataState>(FORM_INICIAL);

  async function carregarServicos() {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch("/api/servicos", {
        method: "GET",
        cache: "no-store",
      });

      const data = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao carregar serviços.");
      }

      setServicos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      setErro(error?.message || "Não foi possível carregar os serviços.");
      setServicos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarServicos();
  }, []);

  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(() => setMensagem(""), 3000);
    return () => clearTimeout(timer);
  }, [mensagem]);

  function abrirNovo() {
    setModoEdicao(false);
    setServicoEditandoId(null);
    setForm(FORM_INICIAL);
    setErro("");
    setModalAberto(true);
  }

  function abrirEdicao(servico: Servico) {
    setModoEdicao(true);
    setServicoEditandoId(servico.id);
    setForm({
      nome: servico.nome ?? "",
      descricao: servico.descricao ?? "",
      duracao_minutos: String(servico.duracao_minutos ?? 60),
      preco: String(servico.preco ?? ""),
      ativo: Boolean(servico.ativo),
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    if (salvando) return;
    setModalAberto(false);
    setModoEdicao(false);
    setServicoEditandoId(null);
    setForm(FORM_INICIAL);
    setErro("");
  }

  function atualizarCampo<K extends keyof FormDataState>(campo: K, valor: FormDataState[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function validarFormulario() {
    if (!form.nome.trim()) return "Informe o nome do serviço.";
    if (!form.duracao_minutos.trim()) return "Informe a duração em minutos.";
    if (Number(form.duracao_minutos) <= 0) return "A duração deve ser maior que zero.";
    if (!form.preco.trim()) return "Informe o preço.";
    if (Number(form.preco) < 0) return "O preço não pode ser negativo.";
    return "";
  }

  async function salvarServico(e: React.FormEvent) {
    e.preventDefault();

    const erroValidacao = validarFormulario();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || null,
        duracao_minutos: Number(form.duracao_minutos),
        preco: Number(form.preco),
        ativo: form.ativo,
      };

      const response = await fetch("/api/servicos", {
        method: modoEdicao ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          modoEdicao
            ? {
                id: servicoEditandoId,
                ...payload,
              }
            : payload
        ),
      });

      const data = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao salvar serviço.");
      }

      setMensagem(modoEdicao ? "Serviço atualizado com sucesso." : "Serviço criado com sucesso.");
      fecharModal();
      await carregarServicos();
    } catch (error: any) {
      setErro(error?.message || "Não foi possível salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirServico(id: string, nome: string) {
    const confirmado = window.confirm(`Deseja realmente excluir o serviço "${nome}"?`);
    if (!confirmado) return;

    try {
      setErro("");

      const response = await fetch("/api/servicos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await parseResponseSafely(response);

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao excluir serviço.");
      }

      setMensagem("Serviço excluído com sucesso.");
      await carregarServicos();
    } catch (error: any) {
      setErro(error?.message || "Não foi possível excluir o serviço.");
    }
  }

  const servicosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    if (!termo) return servicos;

    return servicos.filter((servico) => {
      const nome = servico.nome?.toLowerCase() || "";
      const descricao = servico.descricao?.toLowerCase() || "";
      return nome.includes(termo) || descricao.includes(termo);
    });
  }, [servicos, busca]);

  function formatarMoeda(valor: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor || 0));
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="rounded-xl bg-amber-500/15 p-2 text-amber-400">
                  <Wrench size={20} />
                </div>
                <span className="text-sm font-medium uppercase tracking-[0.25em] text-amber-400">
                  EstApp
                </span>
              </div>

              <h1 className="text-2xl font-bold md:text-3xl">Serviços</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Cadastre, edite e exclua os serviços oferecidos pela profissional.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={carregarServicos}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>

              <button
                onClick={abrirNovo}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400"
              >
                <Plus size={16} />
                Novo serviço
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Total</p>
              <p className="mt-2 text-2xl font-bold">{servicos.length}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Ativos</p>
              <p className="mt-2 text-2xl font-bold">
                {servicos.filter((item) => item.ativo).length}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Inativos</p>
              <p className="mt-2 text-2xl font-bold">
                {servicos.filter((item) => !item.ativo).length}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou descrição..."
              className="w-full rounded-2xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-500"
            />
          </div>

          <div className="text-sm text-zinc-400">
            {servicosFiltrados.length} serviço(s) encontrado(s)
          </div>
        </div>

        {erro && !modalAberto && (
          <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="mb-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {mensagem}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          {loading ? (
            <div className="p-8 text-center text-zinc-400">Carregando serviços...</div>
          ) : servicosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 rounded-2xl bg-white/5 p-4 text-zinc-400">
                <Wrench size={28} />
              </div>
              <h2 className="text-xl font-semibold">Nenhum serviço encontrado</h2>
              <p className="mt-2 max-w-md text-sm text-zinc-400">
                Cadastre o primeiro serviço para começar a montar a vitrine da profissional.
              </p>
              <button
                onClick={abrirNovo}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-amber-400"
              >
                <Plus size={16} />
                Criar primeiro serviço
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-black/40">
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-zinc-400">
                    <th className="px-4 py-4">Serviço</th>
                    <th className="px-4 py-4">Duração</th>
                    <th className="px-4 py-4">Preço</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {servicosFiltrados.map((servico) => (
                    <tr
                      key={servico.id}
                      className="border-t border-white/10 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-4">
                        <div className="font-semibold text-white">{servico.nome}</div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {servico.descricao?.trim() || "Sem descrição"}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-sm text-zinc-300">
                        {servico.duracao_minutos} min
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-amber-400">
                        {formatarMoeda(servico.preco)}
                      </td>

                      <td className="px-4 py-4">
                        {servico.ativo ? (
                          <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full border border-zinc-500/30 bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-300">
                            Inativo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirEdicao(servico)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                          >
                            <Pencil size={16} />
                            Editar
                          </button>

                          <button
                            onClick={() => excluirServico(servico.id, servico.nome)}
                            className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {modoEdicao ? "Editar serviço" : "Novo serviço"}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Preencha os dados abaixo para salvar o serviço.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            {erro && (
              <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {erro}
              </div>
            )}

            <form onSubmit={salvarServico} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Nome do serviço
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  placeholder="Ex.: Design de sobrancelha"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Descrição
                </label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => atualizarCampo("descricao", e.target.value)}
                  placeholder="Detalhes do serviço..."
                  rows={4}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Duração (minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.duracao_minutos}
                    onChange={(e) => atualizarCampo("duracao_minutos", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-300">
                    Preço
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.preco}
                    onChange={(e) => atualizarCampo("preco", e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => atualizarCampo("ativo", e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-black"
                  />
                  <span className="text-sm text-zinc-300">Serviço ativo para agendamento</span>
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row md:justify-end">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {salvando ? "Salvando..." : modoEdicao ? "Salvar alterações" : "Criar serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}