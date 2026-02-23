import Link from "next/link";

import { deleteCustomerAction } from "@/modules/customers/actions";
import { listCustomers, sanitizeCustomerSearch } from "@/modules/customers/repository";

type CustomersPageProps = {
  searchParams: Promise<{
    query?: string;
    success?: string;
    error?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Cliente creado correctamente.",
  updated: "Cliente actualizado correctamente.",
  deleted: "Cliente eliminado correctamente.",
};

const errorMessages: Record<string, string> = {
  delete: "No se pudo eliminar el cliente. Intentalo nuevamente.",
  "not-found": "El cliente ya no existe.",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { query: rawQuery, success, error } = await searchParams;
  const query = sanitizeCustomerSearch(rawQuery);
  const customers = await listCustomers(query);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Clientes</h2>
          <p className="text-sm text-zinc-600">Gestiona los clientes del ERP.</p>
        </div>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Nuevo cliente
        </Link>
      </div>

      {success && successMessages[success] ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessages[success]}
        </div>
      ) : null}

      {error && errorMessages[error] ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessages[error]}
        </div>
      ) : null}

      <form action="/dashboard/customers" method="get" className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por nombre o email"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          />
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Buscar
          </button>
          {query ? (
            <Link
              href="/dashboard/customers"
              className="rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Limpiar
            </Link>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Telefono</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No hay clientes para mostrar.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">{customer.name}</td>
                  <td className="px-4 py-3 text-zinc-700">{customer.email ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{customer.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatDate(customer.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/customers/${customer.id}/edit`}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <form action={deleteCustomerAction}>
                        <input type="hidden" name="id" value={customer.id} />
                        <input type="hidden" name="query" value={query} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
