"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type Representante = {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  parceiro_id: string | null;
  parceiro_nome: string | null;
  tipo_acesso: "representante" | "supervisor" | "gestor_comercial";
  status: "ativo" | "inativo" | "suspenso" | "bloqueado";
  observacoes: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

type ParceiroOption = {
  id: string;
  nome_fantasia: string;
};

const STATUS_OPTIONS = ["todos", "ativo", "inativo", "suspenso", "bloqueado"] as const;

export default function RepresentantesPage() {
  const [representantes, setRepresentantes] = useState<Representante[]>([]);
  const [parceiros, setParceiros] = useState<ParceiroOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<(typeof STATUS_OPTIONS)[number]>("todos");
  const [parceiroFiltro, setParceiroFiltro] = useState("todos");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarTudo() {
    setLoading(true);
    setErro("");
    setMensagem("");

    const [{ data: reps, error: repsError }, { data: pars, error: parsError }] = await Promise.all([
      supabase
        .from("v_representantes_com_parceiro")
        .select("*")
        .order("criado_em", { ascending: false }),
      supabase
        .from("parceiros_comerciais")
        .select("id, nome_fantasia")
        .order("nome_fantasia", { ascending: true }),
    ]);

    if (repsError) {
      setErro(`Erro ao carregar representantes: ${repsError.message}`);
      setRepresentantes([]);
      setParceiros((pars || []) as ParceiroOption[]);
      setLoading(false);
      return;
    }

    if (parsError) {
      setErro(`Erro ao carregar parceiros: ${parsError.message}`);
      setParceiros([]);
      setRepresentantes((reps || []) as Representante[]);
      setLoading(false);
      return;
    }

    setRepresentantes((reps || []) as Representante[]);
    setParceiros((pars || []) as ParceiroOption[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  async function alterarStatus(
    id: string,
    novoStatus: "ativo" | "inativo" | "suspenso" | "bloqueado"
  ) {
    setErro("");
    setMensagem("");

    const { error } = await supabase
      .from("representantes")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      setErro(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    setMensagem(`Status alterado para "${novoStatus}" com sucesso.`);
    await carregarTudo();
  }

  const representantesFiltrados = useMemo(() => {
    return representantes.filter((item) => {
      const texto = busca.trim().toLowerCase();

      const bateBusca =
        texto === "" ||
        item.nome?.toLowerCase().includes(texto) ||
        item.email?.toLowerCase().includes(texto) ||
        item.telefone?.toLowerCase().includes(texto) ||
        item.cpf?.toLowerCase().includes(texto) ||
        item.cidade?.toLowerCase().includes(texto) ||
        item.estado?.toLowerCase().includes(texto) ||
        item.parceiro_nome?.toLowerCase().includes(texto);

      const bateStatus = statusFiltro === "todos" || item.status === statusFiltro;
      const bateParceiro = parceiroFiltro === "todos" || item.parceiro_id === parceiroFiltro;

      return bateBusca && bateStatus && bateParceiro;
    });
  }, [representantes, busca, statusFiltro, parceiroFiltro]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Representantes</h1>
          <p className="text-gray-600 mt-1">
            Cadastro, consulta e controle dos representantes comerciais.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/comercial"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
          >
            Voltar
          </Link>

          <Link
            href="/comercial/representantes/novo"
            className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition"
          >
            Novo Representante
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-3xl font-bold mt-2">{representantes.length}</p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Ativos</p>
          <p className="text-3xl font-bold mt-2">
            {representantes.filter((item) => item.status === "ativo").length}
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Suspensos</p>
          <p className="text-3xl font-bold mt-2">
            {representantes.filter((item) => item.status === "suspenso").length}
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Bloqueados</p>
          <p className="text-3xl font-bold mt-2">
            {representantes.filter((item) => item.status === "bloqueado").length}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF, parceiro..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          />

          <select
            value={statusFiltro}
            onChange={(e) =>
              setStatusFiltro(e.target.value as (typeof STATUS_OPTIONS)[number])
            }
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "todos" ? "Todos os status" : status}
              </option>
            ))}
          </select>

          <select
            value={parceiroFiltro}
            onChange={(e) => setParceiroFiltro(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
          >
            <option value="todos">Todos os parceiros</option>
            {parceiros.map((parceiro) => (
              <option key={parceiro.id} value={parceiro.id}>
                {parceiro.nome_fantasia}
              </option>
            ))}
          </select>

          <button
            onClick={carregarTudo}
            className="rounded-xl border px-4 py-3 hover:bg-gray-50 transition"
          >
            Atualizar listagem
          </button>
        </div>

        {erro ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {erro}
          </div>
        ) : null}

        {mensagem ? (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {mensagem}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border overflow-hidden">
        {loading ? (
          <div className="p-6">Carregando representantes...</div>
        ) : representantesFiltrados.length === 0 ? (
          <div className="p-6">Nenhum representante encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Parceiro</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Cidade/UF</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {representantesFiltrados.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{item.nome}</div>
                      <div className="text-sm text-gray-500">
                        {item.cpf || "Sem CPF"}
                      </div>
                    </td>

                    <td className="px-4 py-4">{item.parceiro_nome || "Sem parceiro"}</td>

                    <td className="px-4 py-4">{item.telefone || "-"}</td>

                    <td className="px-4 py-4">{item.email || "-"}</td>

                    <td className="px-4 py-4">
                      {[item.cidade, item.estado].filter(Boolean).join(" / ") || "-"}
                    </td>

                    <td className="px-4 py-4">{item.tipo_acesso}</td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border px-3 py-1 text-sm">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => alterarStatus(item.id, "ativo")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Ativar
                        </button>

                        <button
                          onClick={() => alterarStatus(item.id, "inativo")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Inativar
                        </button>

                        <button
                          onClick={() => alterarStatus(item.id, "suspenso")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Suspender
                        </button>

                        <button
                          onClick={() => alterarStatus(item.id, "bloqueado")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Bloquear
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}