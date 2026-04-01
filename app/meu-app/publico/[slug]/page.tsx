"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type MeuApp = {
  id: string
  nome: string
  slug: string
  descricao?: string
  logo_url?: string
  cor_primaria?: string
  cor_secundaria?: string
  status?: string
}

export default function AppPublico() {
  const params = useParams()

  const slug = params?.slug as string

  const [app, setApp] = useState<MeuApp | null>(null)
  const [loading, setLoading] = useState(true)

  async function carregarApp() {
    try {
      const res = await fetch(`/api/meu-app?slug=${slug}`)

      if (!res.ok) {
        throw new Error("Erro ao carregar app")
      }

      const data = await res.json()

      setApp(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      carregarApp()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando app...
      </div>
    )
  }

  if (!app) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-400">
        App não encontrado.
      </div>
    )
  }

  if (app.status !== "ativo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-yellow-400">
        Este app não está disponível no momento.
      </div>
    )
  }

  const corPrimaria = app.cor_primaria || "#000000"
  const corSecundaria = app.cor_secundaria || "#FFD700"

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: corPrimaria,
      }}
    >

      {/* HEADER */}

      <div
        className="h-[90px] flex items-center justify-center"
        style={{
          backgroundColor: corSecundaria,
        }}
      >

        {app.logo_url ? (
          <img
            src={app.logo_url}
            alt="Logo"
            className="h-14 object-contain"
          />
        ) : (
          <span className="text-black font-bold text-lg">
            {app.nome}
          </span>
        )}

      </div>

      {/* CONTEÚDO */}

      <div className="flex-1 p-6 text-white space-y-6">

        <div className="text-center">

          <h1 className="text-2xl font-bold">
            {app.nome}
          </h1>

          {app.descricao && (
            <p className="text-zinc-300 mt-2">
              {app.descricao}
            </p>
          )}

        </div>

        {/* BOTÕES */}

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

      {/* FOOTER */}

      <div className="text-center text-xs text-zinc-500 pb-4">
        Powered by EstApp
      </div>

    </div>
  )
}