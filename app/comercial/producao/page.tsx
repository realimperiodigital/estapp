"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type ProducaoParceiro = {
  id: string;
  nome_fantasia: string;
  total_representantes: number;
  representantes_ativos: number;
  representantes_suspensos: number;
  representantes_bloqueados: number;
};

export default function ProducaoPage() {

  const [dados, setDados] = useState<ProducaoParceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {

    setLoading(true);

    const { data, error } = await supabase
      .from("v_producao_parceiros")
      .select("*");

    if (error) {

      setErro(error.message);
      setLoading(false);
      return;

    }

    setDados(data || []);
    setLoading(false);

  }

  useEffect(() => {

    carregarDados();

  }, []);

  return (

    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">
            Produção por Parceiro
          </h1>

          <p className="text-gray-600 mt-1">
            Controle de crescimento da rede comercial.
          </p>

        </div>

        <Link
          href="/comercial"
          className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        >
          Voltar
        </Link>

      </div>

      <div className="rounded-2xl border overflow-hidden">

        {loading ? (

          <div className="p-6">
            Carregando dados...
          </div>

        ) : erro ? (

          <div className="p-6 text-red-600">
            {erro}
          </div>

        ) : dados.length === 0 ? (

          <div className="p-6">
            Nenhum parceiro encontrado.
          </div>

        ) : (

          <table className="w-full">

            <thead className="bg-gray-50">

              <tr>

                <th className="px-4 py-3 text-left">
                  Parceiro
                </th>

                <th className="px-4 py-3 text-left">
                  Total
                </th>

                <th className="px-4 py-3 text-left">
                  Ativos
                </th>

                <th className="px-4 py-3 text-left">
                  Suspensos
                </th>

                <th className="px-4 py-3 text-left">
                  Bloqueados
                </th>

              </tr>

            </thead>

            <tbody>

              {dados.map((item) => (

                <tr
                  key={item.id}
                  className="border-t"
                >

                  <td className="px-4 py-4 font-semibold">
                    {item.nome_fantasia}
                  </td>

                  <td className="px-4 py-4">
                    {item.total_representantes}
                  </td>

                  <td className="px-4 py-4">
                    {item.representantes_ativos}
                  </td>

                  <td className="px-4 py-4">
                    {item.representantes_suspensos}
                  </td>

                  <td className="px-4 py-4">
                    {item.representantes_bloqueados}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}