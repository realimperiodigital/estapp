"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  status: string;
  created_at: string;
};

export default function ClientesPage() {
  const searchParams = useSearchParams();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarClientes() {
    setLoading(true);
    setErro("");

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("nome", { ascending: true });

    if (error) {
      setErro(error.message);
      setClientes([]);
      setLoading(false);
      return;
    }

    setClientes((data as Cliente[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");

    if (status === "criado") {
      setMensagem("Cliente cadastrado com sucesso.");
    } else if (status === "atualizado") {
      setMensagem("Cliente atualizado com sucesso.");
    } else if (status === "excluido") {
      setMensagem("Cliente excluído com sucesso.");
    } else {
      setMensagem("");
    }

    if (status) {
      const timer = setTimeout(() => {
        setMensagem("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const clientesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return clientes;

    return clientes.filter((cliente) => {
      const nome = (cliente.nome || "").toLowerCase();
      const cpfCnpj = (cliente.cpf_cnpj || "").toLowerCase();
      const email = (cliente.email || "").toLowerCase();
      const telefone = (cliente.telefone || "").toLowerCase();
      const cidade = (cliente.cidade || "").toLowerCase();
      const estado = (cliente.estado || "").toLowerCase();
      const status = (cliente.status || "").toLowerCase();

      return (
        nome.includes(termo) ||
        cpfCnpj.includes(termo) ||
        email.includes(termo) ||
        telefone.includes(termo) ||
        cidade.includes(termo) ||
        estado.includes(termo) ||
        status.includes(termo)
      );
    });
  }, [clientes, busca]);

  const totalClientes = clientes.length;
  const totalAtivos = clientes.filter((cliente) => cliente.status === "Ativo").length;
  const totalInativos = clientes.filter((cliente) => cliente.status === "Inativo").length;

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-neutral-400 transition hover:text-white"
            >
              ← Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-bold">Clientes</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Cadastro e gerenciamento de clientes.
            </p>
          </div>

          <Link
            href="/clientes/novo"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            + Novo Cliente
          </Link>
        </div>

        {mensagem ? (
          <div className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
            {mensagem}
          </div>
        ) : null}

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
            <p className="text-sm text-neutral-400">Total de clientes</p>
            <h2 className="mt-2 text-3xl font-bold">{totalClientes}</h2>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
            <p className="text-sm text-neutral-400">Clientes ativos</p>
            <h2 className="mt-2 text-3xl font-bold">{totalAtivos}</h2>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
            <p className="text-sm text-neutral-400">Clientes inativos</p>
            <h2 className="mt-2 text-3xl font-bold">{totalInativos}</h2>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Busca de clientes</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Pesquise por nome, CPF/CNPJ, email, telefone, cidade, estado ou status.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 md:max-w-xl md:flex-row">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() => setBusca("")}
                className="rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
          <div className="flex flex-col gap-2 border-b border-neutral-800 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold">Lista de clientes</h2>

            <div className="text-sm text-neutral-400">
              {busca.trim()
                ? `${clientesFiltrados.length} resultado(s) encontrado(s)`
                : `${clientes.length} cliente(s) cadastrado(s)`}
            </div>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-neutral-400">Carregando clientes...</div>
          ) : erro ? (
            <div className="px-5 py-10 text-red-400">
              Erro ao carregar clientes: {erro}
            </div>
          ) : clientes.length === 0 ? (
            <div className="px-5 py-10 text-neutral-400">
              Nenhum cliente cadastrado ainda.
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="px-5 py-10 text-neutral-400">
              Nenhum cliente encontrado para a busca informada.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-neutral-800/70 text-left text-neutral-300">
                  <tr>
                    <th className="px-5 py-4 font-medium">ID</th>
                    <th className="px-5 py-4 font-medium">Nome</th>
                    <th className="px-5 py-4 font-medium">CPF/CNPJ</th>
                    <th className="px-5 py-4 font-medium">Email</th>
                    <th className="px-5 py-4 font-medium">Telefone</th>
                    <th className="px-5 py-4 font-medium">Cidade</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {clientesFiltrados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-t border-neutral-800 text-neutral-200 transition hover:bg-neutral-800/40"
                    >
                      <td className="px-5 py-4">{cliente.id}</td>
                      <td className="px-5 py-4 font-medium">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="transition hover:text-emerald-300"
                        >
                          {cliente.nome}
                        </Link>
                      </td>
                      <td className="px-5 py-4">{cliente.cpf_cnpj || "-"}</td>
                      <td className="px-5 py-4">{cliente.email || "-"}</td>
                      <td className="px-5 py-4">{cliente.telefone || "-"}</td>
                      <td className="px-5 py-4">{cliente.cidade || "-"}</td>
                      <td className="px-5 py-4">{cliente.estado || "-"}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            cliente.status === "Ativo"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {cliente.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/clientes/${cliente.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-3 py-2 text-xs font-semibold text-neutral-200 transition hover:bg-neutral-800"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}