"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function HomePage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Testando conexão com o Supabase...");

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.auth.getSession();

        if (error) {
          setStatus("error");
          setMessage(`Erro ao conectar com Supabase: ${error.message}`);
          return;
        }

        setStatus("success");
        setMessage("Conexão com Supabase ativa com sucesso.");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro desconhecido ao conectar.";
        setStatus("error");
        setMessage(`Falha na conexão: ${errorMessage}`);
      }
    }

    testConnection();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
        <h1 className="text-center text-4xl font-bold">EstApp</h1>

        <p className="mt-3 text-center text-neutral-400">Seu aplicativo exclusivo</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium text-white">Status da conexão</p>

          <div className="mt-3 flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                status === "loading"
                  ? "bg-yellow-400"
                  : status === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-neutral-300">{message}</span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-xl bg-amber-500 px-5 py-4 text-center font-semibold text-black"
          >
            Entrar
          </Link>

          <Link
            href="/dashboard"
            className="block w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-center"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}