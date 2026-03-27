"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const [nome, setNome] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [status, setStatus] = useState("Ativo");

  async function carregarCliente() {
    setLoading(true);
    setErro("");

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setErro(error.message);
      setLoading(false);
      return;
    }

    setNome(data.nome || "");
    setCpfCnpj(data.cpf_cnpj || "");
    setEmail(data.email || "");
    setTelefone(data.telefone || "");
    setCidade(data.cidade || "");
    setEstado(data.estado || "");
    setStatus(data.status || "Ativo");
    setLoading(false);
  }

  async function atualizarCliente(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Nome obrigatório.");
      return;
    }

    setSalvando(true);

    const { error } = await supabase
      .from("clientes")
      .update({
        nome: nome.trim(),
        cpf_cnpj: cpfCnpj.trim() || null,
        email: email.trim() || null,
        telefone: telefone.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim().toUpperCase() || null,
        status,
      })
      .eq("id", id);

    setSalvando(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push("/clientes?status=atualizado");
  }

  async function excluirCliente() {
    setErro("");

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o cliente #${id}? Esta ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    setExcluindo(true);

    const { error } = await supabase.from("clientes").delete().eq("id", id);

    setExcluindo(false);

    if (error) {
      setErro(error.message);
      return;
    }

    router.push("/clientes?status=excluido");
  }

  useEffect(() => {
    carregarCliente();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-3xl">Carregando cliente...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/clientes"
          className="text-sm text-neutral-400 transition hover:text-white"
        >
          ← Voltar para clientes
        </Link>

        <h1 className="mt-3 text-3xl font-bold">Editar Cliente #{id}</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Atualize os dados do cliente ou exclua o registro.
        </p>

        <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
          <form onSubmit={atualizarCliente} className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Nome *
              </label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                CPF/CNPJ
              </label>
              <input
                value={cpfCnpj}
                onChange={(e) => setCpfCnpj(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Telefone
              </label>
              <input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Cidade
              </label>
              <input
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Estado
              </label>
              <input
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                maxLength={2}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 uppercase text-white outline-none transition focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-neutral-700 bg-neutral-950 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {erro ? (
              <div className="md:col-span-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {erro}
              </div>
            ) : null}

            <div className="md:col-span-2 flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={salvando || excluindo}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salvando ? "Salvando..." : "Atualizar Cliente"}
                </button>

                <Link
                  href="/clientes"
                  className="rounded-xl border border-neutral-700 px-5 py-3 text-center text-sm font-semibold text-neutral-200 transition hover:bg-neutral-800"
                >
                  Cancelar
                </Link>
              </div>

              <button
                type="button"
                onClick={excluirCliente}
                disabled={salvando || excluindo}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {excluindo ? "Excluindo..." : "Excluir Cliente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}