import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get("slug")

    if (slug) {
      const { data, error } = await supabase
        .from("meu_app")
        .select("*")
        .eq("slug", slug)
        .single()

      if (error) {
        return NextResponse.json(
          { error: "App não encontrado." },
          { status: 404 }
        )
      }

      return NextResponse.json(data)
    }

    const { data, error } = await supabase
      .from("meu_app")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao buscar apps." },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("GET /api/meu-app error:", error)

    return NextResponse.json(
      { error: error?.message || "Erro interno ao buscar apps." },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const nome = normalizarTexto(body.nome)
    const cliente = normalizarTexto(body.cliente)
    const descricao = normalizarTexto(body.descricao)
    const logo_url = normalizarTexto(body.logo_url) || null
    const cor_primaria = normalizarTexto(body.cor_primaria) || "#f59e0b"
    const cor_secundaria = normalizarTexto(body.cor_secundaria) || "#000000"
    const status = normalizarStatus(body.status)

    let slug = normalizarTexto(body.slug)
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
      .maybeSingle()

    if (erroSlug) {
      return NextResponse.json(
        { error: erroSlug.message || "Erro ao validar slug." },
        { status: 500 }
      )
    }

    if (existenteSlug) {
      return NextResponse.json(
        { error: "Já existe um app com esse slug." },
        { status: 400 }
      )
    }

    const payloadInsert = {
      nome,
      cliente,
      descricao: descricao || null,
      slug,
      logo_url,
      cor_primaria,
      cor_secundaria,
      status,
    }

    const { data, error } = await supabase
      .from("meu_app")
      .insert([payloadInsert])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message || "Erro ao criar app." },
        { status: 500 }
      )
    }

    if (data?.id) {
      await registrarLog({
        meu_app_id: String(data.id),
        acao: "criacao",
        descricao: `App criado: ${data.nome}`,
        payload: data,
      })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("POST /api/meu-app error:", error)

    return NextResponse.json(
      { error: error?.message || "Erro interno ao criar app." },
      { status: 500 }
    )
  }
}