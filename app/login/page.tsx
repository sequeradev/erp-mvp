import { createPlaceholderSession } from "@/app/login/actions";

type LoginPageProps = {
  searchParams: Promise<{ from?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900">Acceso al ERP</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Pantalla temporal de acceso. Auth.js ya esta preparado, falta conectar el proveedor final.
        </p>
        <form action={createPlaceholderSession}>
          <input type="hidden" name="from" value={from ?? "/dashboard"} />
          <button
            type="submit"
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Entrar con sesion placeholder
          </button>
        </form>
      </div>
    </main>
  );
}
