import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch =
    cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/) ||
    cookieHeader.match(/supabase-auth-token=([^;]+)/);

  if (!tokenMatch) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(tokenMatch[1]);
    const parsed = JSON.parse(decoded);

    if (Array.isArray(parsed)) {
      return parsed[0];
    }

    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário inválido." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("profissional_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro interno." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário inválido." },
        { status: 401 }
      );
    }

    const payload = {
      profissional_id: user.id,
      nome: body.nome,
      telefone: body.telefone || null,
      email: body.email || null,
      observacoes: body.observacoes || null,
    };

    const { data, error } = await supabase
      .from("clientes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro interno." },
      { status: 500 }
    );
  }
}