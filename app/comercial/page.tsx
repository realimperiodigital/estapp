"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ComercialPage() {

  const [totalParceiros, setTotalParceiros] = useState(0);
  const [totalRepresentantes, setTotalRepresentantes] = useState(0);
  const [ativos, setAtivos] = useState(0);

  async function carregarDados() {

    const { count: parceirosCount } = await supabase
      .from("parceiros_comerciais")
      .select("*", { count: "exact", head: true });

    const { count: repsCount } = await supabase
      .from("representantes")
      .select("*", { count: "exact", head: true });

    const { count: ativosCount } = await supabase
      .from("representantes")
      .select("*", { count: "exact", head: true })
      .eq("status", "ativo");

    setTotalParceiros(parceirosCount || 0);
    setTotalRepresentantes(repsCount || 0);
    setAtivos(ativosCount || 0);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  return (

    <div className="p-8 space-y-6">

      <div>

        <h1 className="text-3xl font-bold">
          Módulo Comercial
        </h1>

        <p className="text-gray-600 mt-1">
          Gestão de parceiros e representantes comerciais.
        </p>

      </div>

      {/* Cards */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-2xl border p-6">

          <p className="text-sm text-gray-500">
            Parceiros
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalParceiros}
          </p>

        </div>

        <div className="rounded-2xl border p-6">

          <p className="text-sm text-gray-500">
            Representantes
          </p>

          <p className="text-3xl font-bold mt-2">
            {totalRepresentantes}
          </p>

        </div>

        <div className="rounded-2xl border p-6">

          <p className="text-sm text-gray-500">
            Representantes Ativos
          </p>

          <p className="text-3xl font-bold mt-2">
            {ativos}
          </p>

        </div>

      </div>

      {/* Navegação */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Link
          href="/comercial/parceiros"
          className="rounded-2xl border p-6 hover:bg-gray-50 transition"
        >

          <h2 className="text-xl font-semibold">
            Parceiros Comerciais
          </h2>

          <p className="text-gray-600 mt-2">
            Cadastro e gestão dos parceiros.
          </p>

        </Link>

        <Link
          href="/comercial/representantes"
          className="rounded-2xl border p-6 hover:bg-gray-50 transition"
        >

          <h2 className="text-xl font-semibold">
            Representantes
          </h2>

          <p className="text-gray-600 mt-2">
            Cadastro e controle dos representantes.
          </p>

        </Link>

      </div>

    </div>

  );

}