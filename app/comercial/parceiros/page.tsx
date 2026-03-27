"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

type ParceiroComercial = {
  id: string;
  nome_fantasia: string;
  razao_social: string | null;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  responsavel: string | null;
  status: "ativo" | "inativo" | "suspenso" | "bloqueado";
  observacoes: string | null;
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

const STATUS_OPTIONS = ["todos", "ativo", "inativo", "suspenso", "bloqueado"] as const;

export default function ParceirosPage() {
  const [parceiros, setParceiros] = useState<ParceiroComercial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<(typeof STATUS_OPTIONS)[number]>("todos");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarParceiros() {
    setLoading(true);
    setErro("");
    setMensagem("");

    const { data, error } = await supabase
      .from("parceiros_comerciais")
      .select("*")
      .order("criado_em", { ascending: false });

    if (error) {
      setErro(`Erro ao carregar parceiros: ${error.message}`);
      setParceiros([]);
      setLoading(false);
      return;
    }

    setParceiros((data || []) as ParceiroComercial[]);
    setLoading(false);
  }

  useEffect(() => {
    carregarParceiros();
  }, []);

  async function alterarStatus(
    id: string,
    novoStatus: "ativo" | "inativo" | "suspenso" | "bloqueado"
  ) {
    setErro("");
    setMensagem("");

    const { error } = await supabase
      .from("parceiros_comerciais")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      setErro(`Erro ao atualizar status: ${error.message}`);
      return;
    }

    setMensagem(`Status alterado para "${novoStatus}" com sucesso.`);
    await carregarParceiros();
  }

  const parceirosFiltrados = useMemo(() => {
    return parceiros.filter((parceiro) => {
      const texto = busca.trim().toLowerCase();

      const bateBusca =
        texto === "" ||
        parceiro.nome_fantasia?.toLowerCase().includes(texto) ||
        parceiro.razao_social?.toLowerCase().includes(texto) ||
        parceiro.email?.toLowerCase().includes(texto) ||
        parceiro.telefone?.toLowerCase().includes(texto) ||
        parceiro.cpf_cnpj?.toLowerCase().includes(texto) ||
        parceiro.cidade?.toLowerCase().includes(texto) ||
        parceiro.estado?.toLowerCase().includes(texto) ||
        parceiro.responsavel?.toLowerCase().includes(texto);

      const bateStatus = statusFiltro === "todos" || parceiro.status === statusFiltro;

      return bateBusca && bateStatus;
    });
  }, [parceiros, busca, statusFiltro]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parceiros Comerciais</h1>
          <p className="text-gray-600 mt-1">
            Cadastro, consulta e controle dos parceiros do módulo comercial.
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
            href="/comercial/parceiros/novo"
            className="rounded-xl bg-black text-white px-4 py-2 hover:opacity-90 transition"
          >
            Novo Parceiro
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Total de parceiros</p>
          <p className="text-3xl font-bold mt-2">{parceiros.length}</p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Ativos</p>
          <p className="text-3xl font-bold mt-2">
            {parceiros.filter((item) => item.status === "ativo").length}
          </p>
        </div>

        <div className="rounded-2xl border p-4">
          <p className="text-sm text-gray-500">Suspensos/Bloqueados</p>
          <p className="text-3xl font-bold mt-2">
            {
              parceiros.filter(
                (item) => item.status === "suspenso" || item.status === "bloqueado"
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-2xl border p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, telefone, cidade..."
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

          <button
            onClick={carregarParceiros}
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
          <div className="p-6">Carregando parceiros...</div>
        ) : parceirosFiltrados.length === 0 ? (
          <div className="p-6">Nenhum parceiro encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead className="bg-gray-50">
                <tr className="text-left">
                  <th className="px-4 py-3">Nome Fantasia</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Telefone</th>
                  <th className="px-4 py-3">E-mail</th>
                  <th className="px-4 py-3">Cidade/UF</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>

              <tbody>
                {parceirosFiltrados.map((parceiro) => (
                  <tr key={parceiro.id} className="border-t">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{parceiro.nome_fantasia}</div>
                      <div className="text-sm text-gray-500">
                        {parceiro.razao_social || "Sem razão social"}
                      </div>
                    </td>

                    <td className="px-4 py-4">{parceiro.responsavel || "-"}</td>

                    <td className="px-4 py-4">{parceiro.telefone || "-"}</td>

                    <td className="px-4 py-4">{parceiro.email || "-"}</td>

                    <td className="px-4 py-4">
                      {[parceiro.cidade, parceiro.estado].filter(Boolean).join(" / ") || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full border px-3 py-1 text-sm">
                        {parceiro.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => alterarStatus(parceiro.id, "ativo")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Ativar
                        </button>

                        <button
                          onClick={() => alterarStatus(parceiro.id, "inativo")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Inativar
                        </button>

                        <button
                          onClick={() => alterarStatus(parceiro.id, "suspenso")}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                          Suspender
                        </button>

                        <button
                          onClick={() => alterarStatus(parceiro.id, "bloqueado")}
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