"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

type MeuApp = {
  id: string
  nome: string
  slug: string
  logo_url?: string
  cor_primaria?: string
  cor_secundaria?: string
  status?: string
}

export default function PreviewMeuApp() {
  const params = useParams()
  const router = useRouter()

  const id = params?.id as string

  const [app, setApp] = useState<MeuApp | null>(null)
  const [loading, setLoading] = useState(true)

  async function carregarApp() {
    try {
      const res = await fetch(`/api/meu-app/${id}`)

      if (!res.ok) {
        throw new Error("Erro ao carregar app")
      }

      const data = await res.json()

      setApp(data)
    } catch (error) {
      console.error(error)
      alert("Erro ao carregar preview do app.")
      router.push("/meu-app")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      carregarApp()
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-10 text-white">
        Carregando preview do app...
      </div>
    )
  }

  if (!app) {
    return (
      <div className="p-10 text-red-400">
        App não encontrado.
      </div>
    )
  }

  const corPrimaria = app.cor_primaria || "#111111"
  const corSecundaria = app.cor_secundaria || "#FFD700"

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-10">

      {/* CABEÇALHO */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center">

        <h1 className="text-white text-xl font-bold">
          Preview do App
        </h1>

        <button
          onClick={() => router.push("/meu-app")}
          className="px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700"
        >
          Voltar
        </button>

      </div>

      {/* SIMULAÇÃO DO CELULAR */}

      <div
        className="w-[320px] h-[600px] rounded-3xl shadow-2xl overflow-hidden border border-zinc-700"
        style={{
          backgroundColor: corPrimaria,
        }}
      >

        {/* HEADER */}

        <div
          className="h-[80px] flex items-center justify-center"
          style={{
            backgroundColor: corSecundaria,
          }}
        >
          {app.logo_url ? (
            <img
              src={app.logo_url}
              alt="Logo"
              className="h-12 object-contain"
            />
          ) : (
            <span className="text-black font-bold">
              {app.nome}
            </span>
          )}
        </div>

        {/* CONTEÚDO */}

        <div className="p-6 text-white space-y-4">

          <div className="text-center">

            <h2 className="text-lg font-bold">
              {app.nome}
            </h2>

            <p className="text-sm text-zinc-300 mt-1">
              Status: {app.status || "rascunho"}
            </p>

          </div>

          {/* BOTÕES SIMULADOS */}

          <div className="space-y-3 mt-6">

            <button
              className="w-full py-3 rounded-xl font-semibold"
              style={{
                backgroundColor: corSecundaria,
                color: "#000",
              }}
            >
              Agendar Atendimento
            </button>

            <button
              className="w-full py-3 rounded-xl border"
              style={{
                borderColor: corSecundaria,
                color: corSecundaria,
              }}
            >
              Ver Serviços
            </button>

            <button
              className="w-full py-3 rounded-xl border border-zinc-600 text-zinc-300"
            >
              Falar no WhatsApp
            </button>

          </div>

        </div>

      </div>

      {/* INFO SLUG */}

      <div className="mt-6 text-center text-zinc-400 text-sm">

        URL pública futura:

        <div className="text-yellow-400 mt-1 font-mono">
          /meu-app/publico/{app.slug}
        </div>

      </div>

    </div>
  )
}