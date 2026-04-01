"use client";

import { useState } from "react";

type ClienteFormValues = {
  nome: string;
  telefone: string;
  email: string;
  observacoes: string;
};

type FormClienteProps = {
  initialValues?: ClienteFormValues;
  onSubmit: (values: ClienteFormValues) => Promise<void>;
  submitLabel?: string;
};

export default function FormCliente({
  initialValues,
  onSubmit,
  submitLabel = "Salvar cliente",
}: FormClienteProps) {
  const [nome, setNome] = useState(initialValues?.nome ?? "");
  const [telefone, setTelefone] = useState(initialValues?.telefone ?? "");
  const [email, setEmail] = useState(initialValues?.email ?? "");
  const [observacoes, setObservacoes] = useState(
    initialValues?.observacoes ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      await onSubmit({
        nome,
        telefone,
        email,
        observacoes,
      });
    } catch (error: any) {
      setErro(error?.message || "Erro ao salvar cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {erro ? (
        <div
          style={{
            background: "#ffe6e6",
            color: "#b30000",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
          }}
        >
          {erro}
        </div>
      ) : null}

      <div style={{ display: "grid", gap: "14px" }}>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#111",
            }}
          >
            Nome
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#111",
            }}
          >
            Telefone
          </label>
          <input
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#111",
            }}
          >
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
              outline: "none",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
              fontWeight: 600,
              color: "#111",
            }}
          >
            Observações
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d9d9d9",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            border: "none",
            borderRadius: "10px",
            background: "#111",
            color: "#fff",
            padding: "12px 16px",
            fontWeight: 700,
          }}
        >
          {loading ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}