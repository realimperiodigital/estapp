import Link from "next/link";

export default function ClientesPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-8">

      <Link href="/dashboard" className="text-sm text-neutral-400">
        ← Dashboard
      </Link>

      <h1 className="text-3xl font-bold mt-6">
        Clientes
      </h1>

      <p className="mt-4 text-neutral-400">
        Cadastro e gerenciamento de clientes.
      </p>

    </main>
  );
}