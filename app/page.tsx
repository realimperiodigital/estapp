import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">

        <h1 className="text-4xl font-bold text-center mb-6">
          EstApp
        </h1>

        <p className="text-center text-neutral-400 mb-10">
          Seu aplicativo exclusivo
        </p>

        <div className="space-y-4">

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