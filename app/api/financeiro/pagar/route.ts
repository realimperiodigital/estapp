import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      id,
      valor_pago,
      forma_pagamento,
      observacao
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID da cobrança não informado.",
          origem: "financeiro_pagar_validacao"
        },
        { status: 400 }
      );
    }

    const dataPagamento = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("financeiro")
      .update({
        status: "pago",
        data_pagamento: dataPagamento,
        valor_pago: valor_pago || null,
        forma_pagamento: forma_pagamento || null,
        observacao: observacao || null
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          origem: "financeiro_pagar_update"
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Pagamento registrado com sucesso.",
        data
      },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao registrar pagamento.",
        origem: "financeiro_pagar_post_catch"
      },
      { status: 500 }
    );
  }
}