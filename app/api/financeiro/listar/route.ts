import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("financeiro")
      .select("*")
      .order("vencimento", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          origem: "financeiro_listar_error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno",
        origem: "financeiro_listar_catch",
      },
      { status: 500 }
    );
  }
}