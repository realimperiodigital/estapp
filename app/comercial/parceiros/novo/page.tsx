"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type FormDataType = {
  nome_fantasia: string;
  razao_social: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  responsavel: string;
  status: "ativo" | "inativo" | "suspenso" | "bloqueado";
  observacoes: string;
};

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
];

export default function NovoParceiroPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormDataType>({
    nome_fantasia: "",
    razao_social: "",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    responsavel: "",
    status: "ativo",
    observacoes: "",
  });

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function updateField<K extends keyof FormDataType>(campo: K, valor: FormDataType[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!form.nome_fantasia.trim()) {
      setErro("O nome fantasia é obrigatório.");
      return;
    }

    setSalvando(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;

    const payload = {
      nome_fantasia: form.nome_fantasia.trim(),
      razao_social: form.razao_social.trim() || null,
      cpf_cnpj: form.cpf_cnpj.trim() || null,
      telefone: form.telefone.trim() || null,
      email: form.email.trim().toLowerCase() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      responsavel: form.responsavel.trim() || null,
      status: form.status,
      observacoes: form.observacoes.trim() || null,
      criado_por: userId,
    };

    const { error } = await supabase
      .from("parceiros_comerciais")
      .insert([payload]);

    setSalvando(false);

    if (error) {
      setErro(`Erro ao salvar parceiro: ${error.message}`);
      return;
    }

    router.push("/comercial/parceiros");
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Novo Parceiro Comercial</h1>
          <p className="text-gray-600 mt-1">
            Cadastre um novo parceiro do módulo comercial.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/comercial/parceiros"
            className="rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
          >
            Voltar
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-6">
        {erro ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {erro}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome fantasia *</label>
            <input
              type="text"
              value={form.nome_fantasia}
              onChange={(e) => updateField("nome_fantasia", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Digite o nome fantasia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Razão social</label>
            <input
              type="text"
              value={form.razao_social}
              onChange={(e) => updateField("razao_social", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Digite a razão social"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CPF / CNPJ</label>
            <input
              type="text"
              value={form.cpf_cnpj}
              onChange={(e) => updateField("cpf_cnpj", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Digite o CPF ou CNPJ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Responsável</label>
            <input
              type="text"
              value={form.responsavel}
              onChange={(e) => updateField("responsavel", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Nome do responsável"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => updateField("telefone", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Telefone do parceiro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="email@empresa.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cidade</label>
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => updateField("cidade", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Cidade"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => updateField("estado", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="">Selecione</option>
              {ESTADOS_BRASIL.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                updateField(
                  "status",
                  e.target.value as "ativo" | "inativo" | "suspenso" | "bloqueado"
                )
              }
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="ativo">ativo</option>
              <option value="inativo">inativo</option>
              <option value="suspenso">suspenso</option>
              <option value="bloqueado">bloqueado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => updateField("observacoes", e.target.value)}
            rows={5}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            placeholder="Observações gerais do parceiro"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-xl bg-black text-white px-5 py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar parceiro"}
          </button>

          <Link
            href="/comercial/parceiros"
            className="rounded-xl border px-5 py-3 hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}