import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-8">

      <Link href="/" className="text-sm text-neutral-400">
        ← Voltar
      </Link>

      <h1 className="text-3xl font-bold mt-6">
        Login
      </h1>

      <div className="mt-8 space-y-4">

        <input
          type="email"
          placeholder="Seu email"
          className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3"
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full rounded-xl border border-white/10 bg-neutral-900 px-4 py-3"
        />

        <button className="w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-black">
          Entrar
        </button>

      </div>

    </main>
  );
}