"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Atendimento = {
  id: string
  titulo: string
  data_atendimento: string
  hora_atendimento: string
  status: string
  clientes?: {
    nome?: string
  } | null
}

export default function AgendaPage() {
  const [lista, setLista] = useState<Atendimento[]>([])

  async function carregar() {
    const { data, error } = await supabase
      .from("agenda_atendimentos")
      .select(`
        id,
        titulo,
        data_atendimento,
        hora_atendimento,
        status,
        clientes (
          nome
        )
      `)
      .order("data_atendimento", { ascending: true })
      .order("hora_atendimento", { ascending: true })

    if (error) {
      console.error("Erro ao carregar agenda:", error)
      return
    }

    const listaTratada: Atendimento[] = (data || []).map((item: any) => ({
      id: String(item.id),
      titulo: item.titulo ?? "",
      data_atendimento: item.data_atendimento ?? "",
      hora_atendimento: item.hora_atendimento ?? "",
      status: item.status ?? "AGENDADO",
      clientes: Array.isArray(item.clientes)
        ? item.clientes[0] ?? null
        : item.clientes ?? null,
    }))

    setLista(listaTratada)
  }

  async function excluir(id: string) {
    const confirmar = window.confirm("Deseja excluir este atendimento?")
    if (!confirmar) return

    const { error } = await supabase
      .from("agenda_atendimentos")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Erro ao excluir atendimento:", error)
      alert("Não foi possível excluir o atendimento.")
      return
    }

    carregar()
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agenda de Atendimentos</h1>

        <Link
          href="/agenda/novo"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Novo Atendimento
        </Link>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border-b p-3 text-left">Cliente</th>
              <th className="border-b p-3 text-left">Título</th>
              <th className="border-b p-3 text-left">Data</th>
              <th className="border-b p-3 text-left">Hora</th>
              <th className="border-b p-3 text-left">Status</th>
              <th className="border-b p-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Nenhum atendimento cadastrado.
                </td>
              </tr>
            ) : (
              lista.map((item) => (
                <tr key={item.id}>
                  <td className="border-b p-3">
                    {item.clientes?.nome || "Sem cliente"}
                  </td>

                  <td className="border-b p-3">{item.titulo}</td>

                  <td className="border-b p-3">{item.data_atendimento}</td>

                  <td className="border-b p-3">{item.hora_atendimento}</td>

                  <td className="border-b p-3">{item.status}</td>

                  <td className="border-b p-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/agenda/${item.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>

                      <button
                        onClick={() => excluir(item.id)}
                        className="text-red-600 hover:underline"
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
  )
}