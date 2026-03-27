"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type Cliente = {
  id: string
  nome: string
}

export default function NovoAtendimento() {

  const router = useRouter()

  const [clientes, setClientes] = useState<Cliente[]>([])

  const [clienteId, setClienteId] = useState("")
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")

  async function carregarClientes() {

    const { data } = await supabase
      .from("clientes")
      .select("id, nome")
      .order("nome")

    if (data) setClientes(data)
  }

  async function salvar() {

    await supabase
      .from("agenda_atendimentos")
      .insert({
        cliente_id: clienteId,
        titulo,
        descricao,
        data_atendimento: data,
        hora_atendimento: hora
      })

    router.push("/agenda")
  }

  useEffect(() => {
    carregarClientes()
  }, [])

  return (

    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Novo Atendimento
      </h1>

      <div className="flex flex-col gap-3">

        <select
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
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

        <button
          onClick={salvar}
          className="bg-black text-white p-2 rounded mt-4"
        >
          Salvar Atendimento
        </button>

      </div>

    </div>

  )
}