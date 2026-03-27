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
    nome: string
  }
}

export default function AgendaPage() {
  const [lista, setLista] = useState<Atendimento[]>([])

  async function carregar() {
    const { data } = await supabase
      .from("agenda_atendimentos")
      .select(`
        id,
        titulo,
        data_atendimento,
        hora_atendimento,
        status,
        clientes(nome)
      `)
      .order("data_atendimento", { ascending: true })

    if (data) setLista(data)
  }

  async function excluir(id: string) {
    if (!confirm("Deseja excluir este atendimento?")) return

    await supabase
      .from("agenda_atendimentos")
      .delete()
      .eq("id", id)

    carregar()
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Agenda de Atendimentos
        </h1>

        <Link
          href="/agenda/novo"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Novo Atendimento
        </Link>

      </div>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>
            <th className="p-2">Cliente</th>
            <th className="p-2">Título</th>
            <th className="p-2">Data</th>
            <th className="p-2">Hora</th>
            <th className="p-2">Status</th>
            <th className="p-2">Ações</th>
          </tr>

        </thead>

        <tbody>

          {lista.map((item) => (

            <tr key={item.id} className="border-t">

              <td className="p-2">
                {item.clientes?.nome}
              </td>

              <td className="p-2">
                {item.titulo}
              </td>

              <td className="p-2">
                {item.data_atendimento}
              </td>

              <td className="p-2">
                {item.hora_atendimento}
              </td>

              <td className="p-2">
                {item.status}
              </td>

              <td className="p-2 flex gap-2">

                <Link
                  href={`/agenda/${item.id}`}
                  className="text-blue-600"
                >
                  Editar
                </Link>

                <button
                  onClick={() => excluir(item.id)}
                  className="text-red-600"
                >
                  Excluir
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}