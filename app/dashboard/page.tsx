import Link from "next/link";
import LogoutButton from "../components/logoutbutton";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-8">
      <div className="mx-auto w-full max-w-md">

        <h1 className="text-3xl font-bold mb-6">
          Dashboard
        </h1>

        <div className="grid gap-4">

          <Link
            href="/agenda"
            className="block rounded-xl border border-white/10 bg-white/5 p-5"
          >
            Agenda
          </Link>

          <Link
            href="/clientes"
            className="block rounded-xl border border-white/10 bg-white/5 p-5"
          >
            Clientes
          </Link>

          <Link
            href="/servicos"
            className="block rounded-xl border border-white/10 bg-white/5 p-5"
          >
            Serviços
          </Link>

          <Link
            href="/perfil"
            className="block rounded-xl border border-white/10 bg-white/5 p-5"
          >
            Perfil
          </Link>

        </div>

        <div className="mt-8">
          <LogoutButton />
        </div>

      </div>
    </main>
  );
}