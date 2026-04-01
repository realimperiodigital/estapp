import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

async function registrarLog(params: {
  financeiro_id: string
  acao: string
  descricao: string
  payload?: any
}) {
  try {
    await supabase.from("financeiro_logs").insert([
      {
        financeiro_id: params.financeiro_id,
        acao: params.acao,
        descricao: params.descricao,
        payload: params.payload ?? null,
      },
    ])
  } catch (error) {
    console.error("Erro ao registrar log financeiro:", error)
  }
}

export async function GET() {
  try {
    const hoje = new Date().toISOString().split("T")[0]

    await supabase
      .from("financeiro")
      .update({ status: "atrasado" })
      .lt("data_vencimento", hoje)
      .neq("status", "pago")
      .neq("status", "cancelado")

    const { data, error } = await supabase
      .from("financeiro")
      .select("*")
      .order("data_vencimento", { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: "Erro ao buscar financeiro." },
        { status: 500 }
      )
    }

    let total = 0
    let pago = 0
    let pendente = 0
    let atrasado = 0

    ;(data || []).forEach((item: any) => {
      total += Number(item.valor || 0)

      if (item.status === "pago") {
        pago += Number(item.valor_pago || item.valor || 0)
      }

      if (item.status === "pendente") {
        pendente += Number(item.valor || 0)
      }

      if (item.status === "atrasado") {
        atrasado += Number(item.valor || 0)
      }
    })

    return NextResponse.json({
      data: data || [],
      resumo: {
        total,
        pago,
        pendente,
        atrasado,
      },
    })
  } catch (error) {
    console.error("GET /api/financeiro error:", error)

    return NextResponse.json(
      { error: "Erro interno financeiro." },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      descricao,
      valor,
      data_vencimento,
      categoria,
    } = body

    if (!descricao || !valor || !data_vencimento) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("financeiro")
      .insert([
        {
          descricao,
          valor: Number(valor),
          data_vencimento,
          categoria: categoria || null,
          status: "pendente",
          valor_pago: 0,
          data_pagamento: null,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Erro ao criar registro." },
        { status: 500 }
      )
    }

    await registrarLog({
      financeiro_id: String(data.id),
      acao: "criacao",
      descricao: `Lançamento criado: ${data.descricao}`,
      payload: data,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("POST /api/financeiro error:", error)

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    )
  }
}