import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body ?? {};

    if (!id) {
      return NextResponse.json(
        {
          ok: false,
          error: "ID não informado.",
          origem: "financeiro_excluir_sem_id",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("financeiro")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          origem: "financeiro_excluir_error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Cobrança excluída com sucesso.",
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno",
        origem: "financeiro_excluir_catch",
      },
      { status: 500 }
    );
  }
}