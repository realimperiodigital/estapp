import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body ?? {};

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID da cobrança não informado.",
          origem: "financeiro_baixar_sem_id",
        },
        { status: 400 }
      );
    }

    const { data: registroAtual, error: erroBusca } = await supabaseAdmin
      .from("financeiro")
      .select("*")
      .eq("id", id)
      .single();

    if (erroBusca) {
      return NextResponse.json(
        {
          ok: false,
          error: erroBusca.message || "Erro ao localizar cobrança.",
          origem: "financeiro_baixar_busca",
        },
        { status: 500 }
      );
    }

    if (!registroAtual) {
      return NextResponse.json(
        {
          ok: false,
          error: "Cobrança não encontrada.",
          origem: "financeiro_baixar_nao_encontrada",
        },
        { status: 404 }
      );
    }

    const payload: Record<string, any> = {
      status: "pago",
    };

    if ("data_pagamento" in registroAtual) {
      payload.data_pagamento = new Date().toISOString();
    }

    if ("valor_pago" in registroAtual) {
      payload.valor_pago = registroAtual.valor ?? null;
    }

    const { data, error } = await supabaseAdmin
      .from("financeiro")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message || "Erro ao baixar cobrança.",
          origem: "financeiro_baixar_update",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Cobrança baixada com sucesso.",
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao baixar cobrança.",
        origem: "financeiro_baixar_catch",
      },
      { status: 500 }
    );
  }
}