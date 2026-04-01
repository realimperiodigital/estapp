import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

type Params = {
  params: {
    id: string
  }
}

function normalizarTexto(valor: unknown) {
  if (valor === undefined || valor === null) return ""
  return String(valor).trim()
}

function normalizarStatus(status?: unknown) {
  const valor = String(status || "rascunho").trim().toLowerCase()

  if (valor === "ativo") return "ativo"
  if (valor === "suspenso") return "suspenso"
  return "rascunho"
}

function gerarSlug(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function registrarLog(params: {
  meu_app_id: string
  acao: string
  descricao: string
  payload?: any
}) {
  try {
    await supabase.from("meu_app_logs").insert([
      {
        meu_app_id: params.meu_app_id,
        acao: params.acao,
        descricao: params.descricao,
        payload: params.payload ?? null,
      },
    ])
  } catch (error) {
    console.error("Erro ao registrar log do meu-app:", error)
  }
}

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const id = String(params?.id || "").trim()

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("meu_app")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || "App não encontrado." },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("GET /api/meu-app/[id] error:", error)

    return NextResponse.json(
      { error: error?.message || "Erro interno ao buscar app." },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const id = String(params?.id || "").trim()

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const body = await req.json()

    const { data: atual, error: errorAtual } = await supabase
      .from("meu_app")
      .select("*")
      .eq("id", id)
      .single()

    if (errorAtual || !atual) {
      return NextResponse.json(
        { error: errorAtual?.message || "App não encontrado." },
        { status: 404 }
      )
    }

    const nome = body.nome !== undefined ? normalizarTexto(body.nome) : atual.nome
    const cliente = body.cliente !== undefined ? normalizarTexto(body.cliente) : atual.cliente
    const descricao =
      body.descricao !== undefined ? normalizarTexto(body.descricao) || null : atual.descricao
    const logo_url =
      body.logo_url !== undefined ? normalizarTexto(body.logo_url) || null : atual.logo_url
    const cor_primaria =
      body.cor_primaria !== undefined ? normalizarTexto(body.cor_primaria) || "#f59e0b" : atual.cor_primaria
    const cor_secundaria =
      body.cor_secundaria !== undefined ? normalizarTexto(body.cor_secundaria) || "#000000" : atual.cor_secundaria
    const status =
      body.status !== undefined ? normalizarStatus(body.status) : atual.status

    let slug =
      body.slug !== undefined ? normalizarTexto(body.slug).toLowerCase() : atual.slug

    if (!slug) {
      slug = gerarSlug(nome)
    }

    if (!nome || !cliente || !slug) {
      return NextResponse.json(
        { error: "Nome, cliente e slug são obrigatórios." },
        { status: 400 }
      )
    }

    const { data: existenteSlug, error: erroSlug } = await supabase
      .from("meu_app")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle()

    if (erroSlug) {
      return NextResponse.json(
        { error: erroSlug.message || "Erro ao validar slug." },
        { status: 500 }
      )
    }

    if (existenteSlug) {
      return NextResponse.json(
        { error: "Já existe outro app com esse slug." },
        { status: 400 }
      )
    }

    const payloadUpdate = {
      nome,
      cliente,
      descricao,
      slug,
      logo_url,
      cor_primaria,
      cor_secundaria,
      status,
    }

    const { data, error } = await supabase
      .from("meu_app")
      .update(payloadUpdate)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao atualizar app." },
        { status: 500 }
      )
    }

    let acao = "edicao"
    let descricaoLog = `App atualizado: ${data.nome}`

    if (status === "ativo" && atual.status !== "ativo") {
      acao = "ativacao"
      descricaoLog = `App ativado: ${data.nome}`
    }

    if (status === "suspenso" && atual.status !== "suspenso") {
      acao = "suspensao"
      descricaoLog = `App suspenso: ${data.nome}`
    }

    if (status === "rascunho" && atual.status !== "rascunho") {
      acao = "rascunho"
      descricaoLog = `App voltou para rascunho: ${data.nome}`
    }

    await registrarLog({
      meu_app_id: String(id),
      acao,
      descricao: descricaoLog,
      payload: {
        antes: atual,
        depois: data,
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("PUT /api/meu-app/[id] error:", error)

    return NextResponse.json(
      { error: error?.message || "Erro interno ao atualizar app." },
      { status: 500 }
    )
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const id = String(params?.id || "").trim()

    if (!id) {
      return NextResponse.json(
        { error: "ID não informado." },
        { status: 400 }
      )
    }

    const { data: atual, error: errorAtual } = await supabase
      .from("meu_app")
      .select("*")
      .eq("id", id)
      .single()

    if (errorAtual || !atual) {
      return NextResponse.json(
        { error: errorAtual?.message || "App não encontrado." },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from("meu_app")
      .delete()
      .eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao excluir app." },
        { status: 500 }
      )
    }

    await registrarLog({
      meu_app_id: String(id),
      acao: "exclusao",
      descricao: `App excluído: ${atual.nome}`,
      payload: atual,
    })

    return NextResponse.json({
      ok: true,
      message: "App excluído com sucesso.",
    })
  } catch (error: any) {
    console.error("DELETE /api/meu-app/[id] error:", error)

    return NextResponse.json(
      { error: error?.message || "Erro interno ao excluir app." },
      { status: 500 }
    )
  }
}