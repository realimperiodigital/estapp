"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"

type MeuAppItem = {
  id: string
  nome: string
  cliente: string
  descricao?: string | null
  slug: string
  logo_url?: string | null
  cor_primaria?: string | null
  cor_secundaria?: string | null
  status: string
  criado_em?: string | null
  created_at?: string | null
}

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function formatarData(data?: string | null) {
  if (!data) return "-"
  const d = new Date(data)
  if (Number.isNaN(d.getTime())) return data
  return d.toLocaleDateString("pt-BR")
}

export default function MeuAppPage() {
  const [apps, setApps] = useState<MeuAppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  const [form, setForm] = useState({
    nome: "",
    cliente: "",
    descricao: "",
    cor_primaria: "#f59e0b",
    cor_secundaria: "#000000",
    status: "rascunho",
    logo_url: "",
  })

  async function carregarApps() {
    try {
      setLoading(true)
      setErro("")

      const res = await fetch("/api/meu-app", {
        cache: "no-store",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao carregar apps.")
      }

      const lista = Array.isArray(data) ? data : data?.data || []
      setApps(lista)
    } catch (error: any) {
      setErro(error?.message || "Erro ao carregar apps.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarApps()
  }, [])

  useEffect(() => {
    if (!sucesso) return
    const timer = setTimeout(() => setSucesso(""), 2500)
    return () => clearTimeout(timer)
  }, [sucesso])

  const totalApps = useMemo(() => apps.length, [apps])
  const totalAtivos = useMemo(
    () => apps.filter((app) => String(app.status).toLowerCase() === "ativo").length,
    [apps]
  )

  function atualizarCampo(campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  async function criarApp(e: React.FormEvent) {
    e.preventDefault()

    try {
      setSalvando(true)
      setErro("")
      setSucesso("")

      const slug = gerarSlug(form.nome)

      const payload = {
        nome: form.nome,
        cliente: form.cliente,
        descricao: form.descricao,
        cor_primaria: form.cor_primaria,
        cor_secundaria: form.cor_secundaria,
        status: form.status.toLowerCase(),
        logo_url: form.logo_url || null,
        slug,
      }

      const res = await fetch("/api/meu-app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao criar app.")
      }

      setSucesso("App criado com sucesso.")
      setForm({
        nome: "",
        cliente: "",
        descricao: "",
        cor_primaria: "#f59e0b",
        cor_secundaria: "#000000",
        status: "rascunho",
        logo_url: "",
      })

      await carregarApps()
    } catch (error: any) {
      setErro(error?.message || "Erro ao criar app.")
    } finally {
      setSalvando(false)
    }
  }

  async function alterarStatus(app: MeuAppItem, novoStatus: string) {
    try {
      setErro("")
      setSucesso("")

      const res = await fetch(`/api/meu-app/${app.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...app,
          status: novoStatus.toLowerCase(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao alterar status.")
      }

      setSucesso(`Status alterado para ${novoStatus}.`)
      await carregarApps()
    } catch (error: any) {
      setErro(error?.message || "Erro ao alterar status.")
    }
  }

  async function excluirApp(app: MeuAppItem) {
    const confirmar = window.confirm(`Deseja excluir o app "${app.nome}"?`)
    if (!confirmar) return

    try {
      setErro("")
      setSucesso("")

      const res = await fetch(`/api/meu-app/${app.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Erro ao excluir app.")
      }

      setSucesso("App excluído com sucesso.")
      await carregarApps()
    } catch (error: any) {
      setErro(error?.message || "Erro ao excluir app.")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-[1.1fr_1.6fr]">
        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <h2 className="text-xl font-bold text-white">Novo App</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Cadastre um novo aplicativo para cliente.
          </p>

          {erro && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {sucesso}
            </div>
          )}

          <form onSubmit={criarApp} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Nome do app</label>
              <input
                value={form.nome}
                onChange={(e) => atualizarCampo("nome", e.target.value)}
                placeholder="Ex.: App Clínica Beleza"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500/50"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Cliente</label>
              <input
                value={form.cliente}
                onChange={(e) => atualizarCampo("cliente", e.target.value)}
                placeholder="Ex.: Clínica Beleza"
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500/50"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => atualizarCampo("descricao", e.target.value)}
                placeholder="Breve descrição do app"
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Logo URL</label>
              <input
                value={form.logo_url}
                onChange={(e) => atualizarCampo("logo_url", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-amber-500/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">Cor primária</label>
                <input
                  type="color"
                  value={form.cor_primaria}
                  onChange={(e) => atualizarCampo("cor_primaria", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black p-2"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">Cor secundária</label>
                <input
                  type="color"
                  value={form.cor_secundaria}
                  onChange={(e) => atualizarCampo("cor_secundaria", e.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black p-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Status</label>
              <select
                value={form.status}
                onChange={(e) => atualizarCampo("status", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-amber-500/50"
              >
                <option value="rascunho">Rascunho</option>
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-2xl bg-amber-500 px-5 py-3 font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? "Criando..." : "Criar App"}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-zinc-950 p-5">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Apps cadastrados</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Lista dos aplicativos criados no sistema.
              </p>
            </div>

            <div className="flex gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-black px-4 py-2 text-zinc-300">
                Total: <span className="font-semibold text-white">{totalApps}</span>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
                Ativos: <span className="font-semibold text-emerald-200">{totalAtivos}</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-white/5 text-left text-zinc-300">
                  <tr>
                    <th className="px-4 py-4 font-medium">Nome</th>
                    <th className="px-4 py-4 font-medium">Cliente</th>
                    <th className="px-4 py-4 font-medium">Slug</th>
                    <th className="px-4 py-4 font-medium">Status</th>
                    <th className="px-4 py-4 font-medium">Criado em</th>
                    <th className="px-4 py-4 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                        Carregando apps...
                      </td>
                    </tr>
                  ) : apps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                        Nenhum app cadastrado.
                      </td>
                    </tr>
                  ) : (
                    apps.map((app) => {
                      const status = String(app.status || "").toLowerCase()
                      const badgeClass =
                        status === "ativo"
                          ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                          : status === "suspenso"
                            ? "bg-red-500/15 text-red-300 border border-red-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"

                      return (
                        <tr key={app.id} className="border-t border-white/10">
                          <td className="px-4 py-4 text-white">{app.nome}</td>
                          <td className="px-4 py-4 text-zinc-300">{app.cliente}</td>
                          <td className="px-4 py-4 text-zinc-400">{app.slug}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeClass}`}>
                              {status || "rascunho"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-zinc-300">
                            {formatarData(app.criado_em || app.created_at)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <Link
                                href={`/meu-app/${app.id}`}
                                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
                              >
                                Detalhes
                              </Link>

                              <Link
                                href={`/meu-app/${app.id}/preview`}
                                className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-300 hover:bg-blue-500/20"
                              >
                                Preview
                              </Link>

                              <a
                                href={`/meu-app/publico/${app.slug}`}
                                target="_blank"
                                className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                              >
                                Abrir público
                              </a>

                              {status !== "ativo" ? (
                                <button
                                  onClick={() => alterarStatus(app, "ativo")}
                                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20"
                                >
                                  Ativar
                                </button>
                              ) : (
                                <button
                                  onClick={() => alterarStatus(app, "suspenso")}
                                  className="rounded-xl border border-zinc-500/30 bg-zinc-500/10 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-500/20"
                                >
                                  Suspender
                                </button>
                              )}

                              <button
                                onClick={() => excluirApp(app)}
                                className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 hover:bg-red-500/20"
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}