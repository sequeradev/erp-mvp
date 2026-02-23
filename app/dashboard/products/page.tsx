import Link from "next/link";

import { deleteProductAction } from "@/modules/products/actions";
import { listProducts, sanitizeProductSearch } from "@/modules/products/repository";

type ProductsPageProps = {
  searchParams: Promise<{
    query?: string;
    success?: string;
    error?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Producto creado correctamente.",
  updated: "Producto actualizado correctamente.",
  deleted: "Producto eliminado correctamente.",
};

const errorMessages: Record<string, string> = {
  delete: "No se pudo eliminar el producto. Intentalo nuevamente.",
  "not-found": "El producto ya no existe.",
};

function formatCurrency(value: number | string) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(numeric);
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { query: rawQuery, success, error } = await searchParams;
  const query = sanitizeProductSearch(rawQuery);
  const products = await listProducts(query);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Productos</h2>
          <p className="text-sm text-zinc-600">Catalogo de productos y stock actual.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory/adjust"
            className="inline-flex items-center rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Ajustar stock
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
          >
            Nuevo producto
          </Link>
        </div>
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

      <form action="/dashboard/products" method="get" className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por nombre o SKU"
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
              href="/dashboard/products"
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
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock actual</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">
                  No hay productos para mostrar.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">{product.name}</td>
                  <td className="px-4 py-3 text-zinc-700">{product.sku}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatCurrency(product.price.toString())}</td>
                  <td className="px-4 py-3 text-zinc-700">{product.currentStock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        product.isActive ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {product.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Editar
                      </Link>
                      <form action={deleteProductAction}>
                        <input type="hidden" name="id" value={product.id} />
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
