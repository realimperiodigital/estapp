import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function normalizeDateTime(value: string | null | undefined) {
  if (!value) return null;
  const v = String(value).trim();
  return v || null;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("agenda")
      .select("*")
      .order("data_hora", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, origem: "agenda_get" },
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
        error: error?.message || "Erro interno ao listar agenda.",
        origem: "agenda_get_catch",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const payload = {
      titulo: String(body?.titulo || "").trim(),
      cliente_nome: String(body?.cliente_nome || "").trim() || null,
      tipo: String(body?.tipo || "atendimento").trim(),
      data_hora: normalizeDateTime(body?.data_hora),
      status: String(body?.status || "agendado").trim(),
      observacoes: String(body?.observacoes || "").trim() || null,
    };

    if (!payload.titulo) {
      return NextResponse.json(
        { ok: false, error: "Título é obrigatório." },
        { status: 400 }
      );
    }

    if (!payload.data_hora) {
      return NextResponse.json(
        { ok: false, error: "Data e hora são obrigatórias." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("agenda")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message, origem: "agenda_post" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Evento criado com sucesso.",
        data,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Erro interno ao salvar evento.",
        origem: "agenda_post_catch",
      },
      { status: 500 }
    );
  }
}