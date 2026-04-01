import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function toNumber(value: any) {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

async function safeCount(table: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) return 0;

  return count ?? 0;
}

export async function GET() {
  try {
    // Contadores principais
    const clientes = await safeCount("clientes");
    const parceiros = await safeCount("parceiros");
    const pipeline = await safeCount("pipeline");
    const agenda = await safeCount("agenda");

    // Financeiro
    const { data: financeiroData, error: financeiroError } =
      await supabase
        .from("financeiro")
        .select("valor,status,vencimento");

    if (financeiroError) {
      return NextResponse.json(
        {
          ok: false,
          error: financeiroError.message,
          origem: "dashboard_financeiro",
        },
        { status: 400 }
      );
    }

    const financeiro = financeiroData ?? [];

    const hoje = new Date().toISOString().slice(0, 10);

    let receitaPrevista = 0;
    let receitaRecebida = 0;
    let receitaPendente = 0;
    let receitaVencida = 0;

    financeiro.forEach((item: any) => {
      const valor = toNumber(item.valor);
      const status = String(item.status || "").toLowerCase();
      const vencimento = item.vencimento;

      receitaPrevista += valor;

      if (status === "pago") {
        receitaRecebida += valor;
      }

      if (status === "pendente") {
        receitaPendente += valor;

        if (vencimento && vencimento < hoje) {
          receitaVencida += valor;
        }
      }
    });

    return NextResponse.json({
      ok: true,
      data: {
        clientes,
        parceiros,
        pipeline,
        agenda,

        financeiro: {
          receitaPrevista,
          receitaRecebida,
          receitaPendente,
          receitaVencida,
          totalLancamentos: financeiro.length,
        },
      },
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Erro interno ao carregar dashboard.",
        origem: "dashboard_get_catch",
      },
      { status: 500 }
    );
  }
}