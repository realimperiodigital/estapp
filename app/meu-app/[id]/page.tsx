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

export default function MeuAppDetalhe() {
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
      alert("Erro ao carregar app.")
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
        Carregando app...
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

  return (
    <div className="p-10 text-white space-y-6">

      <h1 className="text-2xl font-bold">
        Detalhes do App
      </h1>

      <div className="space-y-2">

        <p>
          <strong>Nome:</strong> {app.nome}
        </p>

        <p>
          <strong>Slug:</strong> {app.slug}
        </p>

        <p>
          <strong>Status:</strong> {app.status}
        </p>

      </div>

      <div className="flex gap-3">

        <button
          onClick={() =>
            router.push(`/meu-app/${app.id}/preview`)
          }
          className="px-4 py-2 bg-yellow-500 text-black rounded"
        >
          Abrir Preview
        </button>

        <button
          onClick={() =>
            router.push("/meu-app")
          }
          className="px-4 py-2 bg-zinc-700 rounded"
        >
          Voltar
        </button>

      </div>

    </div>
  )
}