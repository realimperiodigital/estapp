"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type ParceiroOption = {
  id: string;
  nome_fantasia: string;
};

type FormDataType = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  parceiro_id: string;
  tipo_acesso: "representante" | "supervisor" | "gestor_comercial";
  status: "ativo" | "inativo" | "suspenso" | "bloqueado";
  observacoes: string;
};

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
];

export default function NovoRepresentantePage() {
  const router = useRouter();

  const [parceiros, setParceiros] = useState<ParceiroOption[]>([]);
  const [form, setForm] = useState<FormDataType>({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    parceiro_id: "",
    tipo_acesso: "representante",
    status: "ativo",
    observacoes: "",
  });

  const [carregandoParceiros, setCarregandoParceiros] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarParceiros() {
      setCarregandoParceiros(true);

      const { data, error } = await supabase
        .from("parceiros_comerciais")
        .select("id, nome_fantasia")
        .order("nome_fantasia", { ascending: true });

      if (error) {
        setErro(`Erro ao carregar parceiros: ${error.message}`);
        setParceiros([]);
        setCarregandoParceiros(false);
        return;
      }

      setParceiros((data || []) as ParceiroOption[]);
      setCarregandoParceiros(false);
    }

    carregarParceiros();
  }, []);

  function updateField<K extends keyof FormDataType>(campo: K, valor: FormDataType[K]) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (!form.nome.trim()) {
      setErro("O nome do representante é obrigatório.");
      return;
    }

    setSalvando(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? null;

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim() || null,
      telefone: form.telefone.trim() || null,
      email: form.email.trim().toLowerCase() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      parceiro_id: form.parceiro_id || null,
      tipo_acesso: form.tipo_acesso,
      status: form.status,
      observacoes: form.observacoes.trim() || null,
      criado_por: userId,
    };

    const { error } = await supabase
      .from("representantes")
      .insert([payload]);

    setSalvando(false);

    if (error) {
      setErro(`Erro ao salvar representante: ${error.message}`);
      return;
    }

    router.push("/comercial/representantes");
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Novo Representante</h1>
          <p className="text-gray-600 mt-1">
            Cadastre um novo representante comercial.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/comercial/representantes"
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
            <label className="block text-sm font-medium mb-2">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => updateField("nome", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Digite o nome do representante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">CPF</label>
            <input
              type="text"
              value={form.cpf}
              onChange={(e) => updateField("cpf", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="CPF do representante"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => updateField("telefone", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              placeholder="Telefone"
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
            <label className="block text-sm font-medium mb-2">Parceiro vinculado</label>
            <select
              value={form.parceiro_id}
              onChange={(e) => updateField("parceiro_id", e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              disabled={carregandoParceiros}
            >
              <option value="">
                {carregandoParceiros ? "Carregando parceiros..." : "Sem parceiro"}
              </option>
              {parceiros.map((parceiro) => (
                <option key={parceiro.id} value={parceiro.id}>
                  {parceiro.nome_fantasia}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de acesso</label>
            <select
              value={form.tipo_acesso}
              onChange={(e) =>
                updateField(
                  "tipo_acesso",
                  e.target.value as "representante" | "supervisor" | "gestor_comercial"
                )
              }
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            >
              <option value="representante">representante</option>
              <option value="supervisor">supervisor</option>
              <option value="gestor_comercial">gestor_comercial</option>
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
            placeholder="Observações gerais do representante"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-xl bg-black text-white px-5 py-3 hover:opacity-90 transition disabled:opacity-60"
          >
            {salvando ? "Salvando..." : "Salvar representante"}
          </button>

          <Link
            href="/comercial/representantes"
            className="rounded-xl border px-5 py-3 hover:bg-gray-50 transition"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}