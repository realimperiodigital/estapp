"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type StatusFinanceiro = "pendente" | "pago" | "atrasado" | "cancelado"

type FinanceiroItem = {
  id: string
  descricao: string
  categoria?: string | null
  valor: number
  valor_pago?: number | null
  status: StatusFinanceiro
  data_vencimento: string
  data_pagamento?: string | null
  created_at?: string
  updated_at?: string
}

type ResumoFinanceiro = {
  total: number
  pago: number
  pendente: number
  atrasado: number
}

type ApiResponse = {
  data: FinanceiroItem[]
  resumo: ResumoFinanceiro
}

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

function formatarMoeda(valor: number | null | undefined) {
  return moeda.format(Number(valor || 0))
}

function formatarData(data?: string | null) {
  if (!data) return "-"
  const [ano, mes, dia] = data.split("-")
  if (!ano || !mes || !dia) return data
  return `${dia}/${mes}/${ano}`
}

function getStatusClasses(status: StatusFinanceiro) {
  switch (status) {
    case "pago":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
    case "atrasado":
      return "bg-red-500/15 text-red-300 border border-red-500/30"
    case "cancelado":
      return "bg-zinc-500/15 text-zinc-300 border border-zinc-500/30"
    default:
      return "bg-amber-500/15 text-amber-300 border border-amber-500/30"
  }
}

export default function FinanceiroPage() {
  const [registros, setRegistros] = useState<FinanceiroItem[]>([])
  const [resumo, setResumo] = useState<ResumoFinanceiro>({
    total: 0,
    pago: 0,
    pendente: 0,
    atrasado: 0,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  const [filtroStatus, setFiltroStatus] = useState<"todos" | StatusFinanceiro>("todos")
  const [busca, setBusca] = useState("")

  const [modalAberto, setModalAberto] = useState(false)
  const [registroAtual, setRegistroAtual] = useState<FinanceiroItem | null>(null)

  const [form, setForm] = useState({
    descricao: "",
    categoria: "",
    valor: "",
    data_vencimento: "",
    status: "pendente" as StatusFinanceiro,
    valor_pago: "",
    data_pagamento: "",
  })

  async function carregarFinanceiro() {
    try {
      setLoading(true)
      setErro("")

      const response = await fetch("/api/financeiro", {
        cache: "no-store",
      })

      const json: ApiResponse | { error?: string } = await response.json()

      if (!response.ok) {
        throw new Error("error" in json ? json.error || "Erro ao carregar financeiro." : "Erro ao carregar financeiro.")
      }

      const payload = json as ApiResponse

      setRegistros(payload.data || [])
      setResumo(
        payload.resumo || {
          total: 0,
          pago: 0,
          pendente: 0,
          atrasado: 0,
        }
      )
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar financeiro.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarFinanceiro()
  }, [])

  useEffect(() => {
    if (!sucesso) return
    const timer = setTimeout(() => setSucesso(""), 2500)
    return () => clearTimeout(timer)
  }, [sucesso])

  const registrosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      const statusOk = filtroStatus === "todos" ? true : item.status === filtroStatus

      const texto = `${item.descricao || ""} ${item.categoria || ""}`.toLowerCase()
      const buscaOk = busca.trim() === "" ? true : texto.includes(busca.toLowerCase())

      return statusOk && buscaOk
    })
  }, [registros, filtroStatus, busca])

  function abrirModalEdicao(item: FinanceiroItem) {
    setRegistroAtual(item)
    setForm({
      descricao: item.descricao || "",
      categoria: item.categoria || "",
      valor: String(item.valor ?? ""),
      data_vencimento: item.data_vencimento || "",
      status: item.status || "pendente",
      valor_pago:
        item.valor_pago !== null && item.valor_pago !== undefined
          ? String(item.valor_pago)
          : "",
      data_pagamento: item.data_pagamento || "",
    })
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setRegistroAtual(null)
    setForm({
      descricao: "",
      categoria: "",
      valor: "",
      data_vencimento: "",
      status: "pendente",
      valor_pago: "",
      data_pagamento: "",
    })
  }

  function atualizarCampo(campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  async function salvarEdicao() {
    if (!registroAtual) return

    try {
      setSaving(true)
      setErro("")
      setSucesso("")

      const response = await fetch(`/api/financeiro/${registroAtual.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao: form.descricao,
          categoria: form.categoria,
          valor: Number(form.valor || 0),
          data_vencimento: form.data_vencimento,
          status: form.status,
          valor_pago: form.valor_pago === "" ? null : Number(form.valor_pago),
          data_pagamento: form.data_pagamento || null,
        }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao salvar edição.")
      }

      setSucesso("Registro atualizado com sucesso.")
      fecharModal()
      await carregarFinanceiro()
    } catch (error: any) {
      setErro(error?.message || "Erro ao salvar edição.")
    } finally {
      setSaving(false)
    }
  }

  async function alterarStatus(
    item: FinanceiroItem,
    status: StatusFinanceiro,
    opcoes?: { valor_pago?: number; data_pagamento?: string | null }
  ) {
    try {
      setErro("")
      setSucesso("")

      const response = await fetch(`/api/financeiro/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          valor_pago: opcoes?.valor_pago,
          data_pagamento: opcoes?.data_pagamento,
        }),
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao atualizar status.")
      }

      setSucesso(`Status alterado para ${status}.`)
      await carregarFinanceiro()
    } catch (error: any) {
      setErro(error?.message || "Erro ao atualizar status.")
    }
  }

  async function marcarComoPago(item: FinanceiroItem) {
    await alterarStatus(item, "pago", {
      valor_pago: Number(item.valor || 0),
      data_pagamento: new Date().toISOString().split("T")[0],
    })
  }

  async function voltarParaPendente(item: FinanceiroItem) {
    await alterarStatus(item, "pendente", {
      valor_pago: 0,
      data_pagamento: null,
    })
  }

  async function cancelarRegistro(item: FinanceiroItem) {
    const confirmar = window.confirm(`Cancelar o lançamento "${item.descricao}"?`)
    if (!confirmar) return

    await alterarStatus(item, "cancelado", {
      valor_pago: 0,
      data_pagamento: null,
    })
  }

  async function excluirRegistro(item: FinanceiroItem) {
    const confirmar = window.confirm(`Deseja excluir "${item.descricao}"?`)
    if (!confirmar) return

    try {
      setErro("")
      setSucesso("")

      const response = await fetch(`/api/financeiro/${item.id}`, {
        method: "DELETE",
      })

      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || "Erro ao excluir registro.")
      }

      setSucesso("Registro excluído com sucesso.")
      await carregarFinanceiro()
    } catch (error: any) {
      setErro(error?.message || "Erro ao excluir registro.")
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Financeiro</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Controle de lançamentos, pagamentos, pendências e atrasos.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={carregarFinanceiro}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Atualizar
              </button>

              <Link
                href="/financeiro/novo"
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-400"
              >
                Novo lançamento
              </Link>
            </div>
          </div>

          {erro && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {sucesso}
            </div>
          )}
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Total geral</p>
            <h3 className="mt-2 text-2xl font-bold text-white">{formatarMoeda(resumo.total)}</h3>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Recebido</p>
            <h3 className="mt-2 text-2xl font-bold text-emerald-200">{formatarMoeda(resumo.pago)}</h3>
          </div>

          <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300">Pendente</p>
            <h3 className="mt-2 text-2xl font-bold text-amber-200">{formatarMoeda(resumo.pendente)}</h3>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-red-300">Atrasado</p>
            <h3 className="mt-2 text-2xl font-bold text-red-200">{formatarMoeda(resumo.atrasado)}</h3>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Buscar</label>
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Descrição ou categoria"
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasado">Atrasado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-300">
                Total filtrado: <span className="font-semibold text-white">{registrosFiltrados.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-left text-zinc-300">
                <tr>
                  <th className="px-4 py-4 font-medium">Descrição</th>
                  <th className="px-4 py-4 font-medium">Categoria</th>
                  <th className="px-4 py-4 font-medium">Valor</th>
                  <th className="px-4 py-4 font-medium">Valor pago</th>
                  <th className="px-4 py-4 font-medium">Vencimento</th>
                  <th className="px-4 py-4 font-medium">Pagamento</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Ações</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                      Carregando financeiro...
                    </td>
                  </tr>
                ) : registrosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                ) : (
                  registrosFiltrados.map((item) => (
                    <tr key={item.id} className="border-t border-white/10">
                      <td className="px-4 py-4">
                        <div className="font-medium text-white">{item.descricao}</div>
                      </td>

                      <td className="px-4 py-4 text-zinc-300">{item.categoria || "-"}</td>

                      <td className="px-4 py-4 font-medium text-white">
                        {formatarMoeda(item.valor)}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {formatarMoeda(item.valor_pago || 0)}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {formatarData(item.data_vencimento)}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        {formatarData(item.data_pagamento)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => abrirModalEdicao(item)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                          >
                            Editar
                          </button>

                          {item.status !== "pago" && item.status !== "cancelado" && (
                            <button
                              onClick={() => marcarComoPago(item)}
                              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                            >
                              Marcar pago
                            </button>
                          )}

                          {item.status === "pago" && (
                            <button
                              onClick={() => voltarParaPendente(item)}
                              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                            >
                              Voltar pendente
                            </button>
                          )}

                          {item.status !== "cancelado" && (
                            <button
                              onClick={() => cancelarRegistro(item)}
                              className="rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-500/20"
                            >
                              Cancelar
                            </button>
                          )}

                          <button
                            onClick={() => excluirRegistro(item)}
                            className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Editar lançamento</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  Atualize os dados financeiros do registro.
                </p>
              </div>

              <button
                onClick={fecharModal}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Fechar
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-300">Descrição</label>
                <input
                  value={form.descricao}
                  onChange={(e) => atualizarCampo("descricao", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Categoria</label>
                <input
                  value={form.categoria}
                  onChange={(e) => atualizarCampo("categoria", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor}
                  onChange={(e) => atualizarCampo("valor", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Data de vencimento</label>
                <input
                  type="date"
                  value={form.data_vencimento}
                  onChange={(e) => atualizarCampo("data_vencimento", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => atualizarCampo("status", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                >
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="atrasado">Atrasado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Valor pago</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valor_pago}
                  onChange={(e) => atualizarCampo("valor_pago", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-zinc-300">Data de pagamento</label>
                <input
                  type="date"
                  value={form.data_pagamento}
                  onChange={(e) => atualizarCampo("data_pagamento", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={fecharModal}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                Cancelar
              </button>

              <button
                onClick={salvarEdicao}
                disabled={saving}
                className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}