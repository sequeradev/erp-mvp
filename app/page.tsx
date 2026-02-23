import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">ERP MVP - Base Tecnica</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Proyecto inicializado con Next.js, Tailwind, Prisma y PostgreSQL en Docker.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Login placeholder
          </Link>
        </div>
      </div>
    </main>
  );
}
