import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type Params = {
  params: {
    id: string
  }
}

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

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("financeiro")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Registro não encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/financeiro/[id] error:", error)

    return NextResponse.json(
      { error: "Erro interno ao buscar registro." },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const body = await req.json()

    const {
      descricao,
      valor,
      categoria,
      data_vencimento,
      status,
      valor_pago,
      data_pagamento,
    } = body

    const { data: atual, error: errorAtual } = await supabase
      .from("financeiro")
      .select("*")
      .eq("id", id)
      .single()

    if (errorAtual || !atual) {
      return NextResponse.json(
        { error: "Registro não encontrado." },
        { status: 404 }
      )
    }

    const updateData: Record<string, any> = {}

    if (descricao !== undefined) updateData.descricao = descricao
    if (valor !== undefined) updateData.valor = Number(valor)
    if (categoria !== undefined) updateData.categoria = categoria || null
    if (data_vencimento !== undefined) updateData.data_vencimento = data_vencimento

    if (status !== undefined) {
      updateData.status = status

      if (status === "pago") {
        updateData.valor_pago =
          valor_pago !== undefined && valor_pago !== null && valor_pago !== ""
            ? Number(valor_pago)
            : Number(valor !== undefined ? valor : atual.valor || 0)

        updateData.data_pagamento =
          data_pagamento && String(data_pagamento).trim() !== ""
            ? data_pagamento
            : new Date().toISOString().split("T")[0]
      }

      if (status === "pendente") {
        updateData.valor_pago = 0
        updateData.data_pagamento = null
      }

      if (status === "cancelado") {
        updateData.valor_pago = 0
        updateData.data_pagamento = null
      }

      if (status === "atrasado") {
        updateData.valor_pago = 0
        updateData.data_pagamento = null
      }
    } else {
      if (valor_pago !== undefined) {
        updateData.valor_pago =
          valor_pago === null || valor_pago === "" ? 0 : Number(valor_pago)
      }

      if (data_pagamento !== undefined) {
        updateData.data_pagamento = data_pagamento || null
      }
    }

    const { data, error } = await supabase
      .from("financeiro")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Erro ao atualizar registro." },
        { status: 500 }
      )
    }

    let acao = "edicao"
    let descricaoLog = `Registro atualizado: ${data.descricao}`

    if (status === "pago") {
      acao = "pagamento"
      descricaoLog = `Pagamento registrado: ${data.descricao}`
    }

    if (status === "pendente" && atual.status === "pago") {
      acao = "retorno_pendente"
      descricaoLog = `Registro voltou para pendente: ${data.descricao}`
    }

    if (status === "cancelado") {
      acao = "cancelamento"
      descricaoLog = `Registro cancelado: ${data.descricao}`
    }

    await registrarLog({
      financeiro_id: String(id),
      acao,
      descricao: descricaoLog,
      payload: {
        antes: atual,
        depois: data,
      },
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("PUT /api/financeiro/[id] error:", error)

    return NextResponse.json(
      { error: "Erro interno ao atualizar registro." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const { data: atual, error: errorAtual } = await supabase
      .from("financeiro")
      .select("*")
      .eq("id", id)
      .single()

    if (errorAtual || !atual) {
      return NextResponse.json(
        { error: "Registro não encontrado." },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("financeiro")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: "Erro ao excluir registro." },
        { status: 500 }
      )
    }

    await registrarLog({
      financeiro_id: String(id),
      acao: "exclusao",
      descricao: `Registro excluído: ${atual.descricao}`,
      payload: atual,
    })

    return NextResponse.json({
      ok: true,
      message: "Registro excluído com sucesso.",
    })
  } catch (error) {
    console.error("DELETE /api/financeiro/[id] error:", error)

    return NextResponse.json(
      { error: "Erro interno ao excluir registro." },
      { status: 500 }
    )
  }
}