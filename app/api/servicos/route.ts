import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias no .env.local"
    );
  }

  return createClient(url, serviceRoleKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("servicos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno ao listar serviços.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const nome = String(body?.nome || "").trim();
    const descricao = body?.descricao ? String(body.descricao).trim() : null;
    const duracao_minutos = Number(body?.duracao_minutos || 0);
    const preco = Number(body?.preco || 0);
    const ativo = Boolean(body?.ativo ?? true);

    if (!nome) {
      return NextResponse.json(
        { error: "Nome do serviço é obrigatório." },
        { status: 400 }
      );
    }

    if (duracao_minutos <= 0) {
      return NextResponse.json(
        { error: "Duração do serviço deve ser maior que zero." },
        { status: 400 }
      );
    }

    if (preco < 0) {
      return NextResponse.json(
        { error: "Preço inválido." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("servicos")
      .insert([
        {
          nome,
          descricao,
          duracao_minutos,
          preco,
          ativo,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno ao criar serviço.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const id = String(body?.id || "").trim();
    const nome = String(body?.nome || "").trim();
    const descricao = body?.descricao ? String(body.descricao).trim() : null;
    const duracao_minutos = Number(body?.duracao_minutos || 0);
    const preco = Number(body?.preco || 0);
    const ativo = Boolean(body?.ativo ?? true);

    if (!id) {
      return NextResponse.json(
        { error: "ID do serviço é obrigatório." },
        { status: 400 }
      );
    }

    if (!nome) {
      return NextResponse.json(
        { error: "Nome do serviço é obrigatório." },
        { status: 400 }
      );
    }

    if (duracao_minutos <= 0) {
      return NextResponse.json(
        { error: "Duração do serviço deve ser maior que zero." },
        { status: 400 }
      );
    }

    if (preco < 0) {
      return NextResponse.json(
        { error: "Preço inválido." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("servicos")
      .update({
        nome,
        descricao,
        duracao_minutos,
        preco,
        ativo,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno ao atualizar serviço.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();

    const id = String(body?.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { error: "ID do serviço é obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("servicos")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erro interno ao excluir serviço.",
      },
      { status: 500 }
    );
  }
}