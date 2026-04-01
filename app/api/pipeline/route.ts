import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pipeline")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, origem: "pipeline_get" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data ?? [],
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao listar pipeline.",
        origem: "pipeline_get_catch",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      nome: String(body?.nome || "").trim(),
      telefone: String(body?.telefone || "").trim() || null,
      email: String(body?.email || "").trim() || null,
      origem: String(body?.origem || "").trim() || null,
      etapa: String(body?.etapa || "novo").trim(),
      observacoes: String(body?.observacoes || "").trim() || null,
    };

    if (!payload.nome) {
      return NextResponse.json(
        { ok: false, error: "Nome do lead é obrigatório." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("pipeline")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, origem: "pipeline_post" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Lead criado com sucesso.",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao salvar lead.",
        origem: "pipeline_post_catch",
      },
      { status: 500 }
    );
  }
}