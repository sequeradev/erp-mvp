import Link from "next/link";
import { notFound } from "next/navigation";

import { listRecentMovementsByProduct } from "@/modules/inventory/repository";
import { getProductDetailById } from "@/modules/products/repository";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductDetailById(id);

  if (!product) {
    notFound();
  }

  const recentMovements = await listRecentMovementsByProduct(product.id, 10);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">{product.name}</h2>
          <p className="text-sm text-zinc-600">SKU: {product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventory/adjust?productId=${product.id}`}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Ajustar stock
          </Link>
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Editar
          </Link>
          <Link
            href="/dashboard/products"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Volver
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Stock actual</h3>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{product.stock.current}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Precio de venta</h3>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{formatCurrency(product.price.toString())}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Coste</h3>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">
            {product.cost ? formatCurrency(product.cost.toString()) : "-"}
          </p>
        </article>
      </div>

      <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-900">Datos del producto</h3>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Estado</dt>
            <dd className="mt-1 text-sm text-zinc-900">{product.isActive ? "Activo" : "Inactivo"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Creado</dt>
            <dd className="mt-1 text-sm text-zinc-900">{formatDate(product.createdAt)}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Descripcion</dt>
            <dd className="mt-1 text-sm text-zinc-900">{product.description ?? "Sin descripcion"}</dd>
          </div>
        </dl>
      </article>

      <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-900">Resumen de movimientos</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <p className="text-sm text-zinc-700">
            <span className="font-medium">IN:</span> {product.stock.in}
          </p>
          <p className="text-sm text-zinc-700">
            <span className="font-medium">OUT:</span> {product.stock.out}
          </p>
          <p className="text-sm text-zinc-700">
            <span className="font-medium">ADJUSTMENT:</span> {product.stock.adjustment}
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-zinc-200">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-3 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Tipo</th>
                <th className="px-3 py-2 font-medium">Cantidad</th>
                <th className="px-3 py-2 font-medium">Nota</th>
              </tr>
            </thead>
            <tbody>
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-zinc-500">
                    Sin movimientos registrados.
                  </td>
                </tr>
              ) : (
                recentMovements.map((movement) => (
                  <tr key={movement.id} className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">{formatDate(movement.createdAt)}</td>
                    <td className="px-3 py-2 text-zinc-700">{movement.type}</td>
                    <td className="px-3 py-2 text-zinc-700">{movement.quantity}</td>
                    <td className="px-3 py-2 text-zinc-700">{movement.note ?? "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
