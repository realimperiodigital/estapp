"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Cliente = {
  id: number
  nome: string
}

type Atendimento = {
  id: string
  cliente_id: number
  titulo: string
  descricao: string
  data_atendimento: string
  hora_atendimento: string
  status: string
}

export default function EditarAtendimento() {

  const { id } = useParams()
  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])

  const [clienteId, setClienteId] = useState<number | null>(null)
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [status, setStatus] = useState("AGENDADO")

  async function carregarClientes() {

    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .order("nome")

    if (data) setClientes(data)

  }

  async function carregarAtendimento() {

    const { data } = await supabase
      .from("agenda_atendimentos")
      .select("*")
      .eq("id", id)
      .single()

    if (data) {

      setClienteId(data.cliente_id)
      setTitulo(data.titulo)
      setDescricao(data.descricao || "")
      setData(data.data_atendimento)
      setHora(data.hora_atendimento)
      setStatus(data.status)

    }

  }

  async function salvar() {

    await supabase
      .from("agenda_atendimentos")
      .update({
        cliente_id: clienteId,
        titulo,
        descricao,
        data_atendimento: data,
        hora_atendimento: hora,
        status
      })
      .eq("id", id)

    router.push("/agenda")

  }

  async function excluir() {

    if (!confirm("Deseja excluir este atendimento?"))
      return

    await supabase
      .from("agenda_atendimentos")
      .delete()
      .eq("id", id)

    router.push("/agenda")

  }

  useEffect(() => {

    carregarClientes()
    carregarAtendimento()

  }, [])

  return (

    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Editar Atendimento
      </h1>

      <div className="flex flex-col gap-3">

        <select
          value={clienteId || ""}
          onChange={(e) =>
            setClienteId(Number(e.target.value))
          }
          className="border p-2"
        >

          <option value="">
            Selecione Cliente
          </option>

          {clientes.map((c) => (

            <option key={c.id} value={c.id}>
              {c.nome}
            </option>

          ))}

        </select>

        <input
          placeholder="Título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="border p-2"
        />

        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="border p-2"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="border p-2"
        />

        <input
          type="time"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          className="border p-2"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border p-2"
        >

          <option value="AGENDADO">
            AGENDADO
          </option>

          <option value="REALIZADO">
            REALIZADO
          </option>

          <option value="CANCELADO">
            CANCELADO
          </option>

        </select>

        <button
          onClick={salvar}
          className="bg-black text-white p-2 rounded mt-4"
        >
          Salvar Alterações
        </button>

        <button
          onClick={excluir}
          className="bg-red-600 text-white p-2 rounded"
        >
          Excluir Atendimento
        </button>

      </div>

    </div>

  )

}