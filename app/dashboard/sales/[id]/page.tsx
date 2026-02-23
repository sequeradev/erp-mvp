import Link from "next/link";
import { notFound } from "next/navigation";

import { cancelSalesOrderAction, confirmSalesOrderAction } from "@/modules/sales/actions";
import { getSalesOrderById } from "@/modules/sales/repository";

type SalesOrderDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
    error?: string;
    product?: string;
    available?: string;
    requested?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Pedido creado correctamente.",
  updated: "Pedido actualizado correctamente.",
  confirmed: "Pedido confirmado correctamente.",
  cancelled: "Pedido cancelado correctamente.",
};

const errorMessages: Record<string, string> = {
  "not-draft-edit": "El pedido no esta en DRAFT y no puede editarse.",
  "invalid-order": "Pedido invalido.",
  "not-found": "El pedido no existe.",
  "already-confirmed": "El pedido ya estaba confirmado.",
  cancelled: "No se puede confirmar un pedido cancelado.",
  "invalid-status": "El estado del pedido no permite esta accion.",
  "cancel-confirmed-not-allowed": "No se puede cancelar un pedido confirmado en este MVP.",
  "already-cancelled": "El pedido ya estaba cancelado.",
};

function formatCurrency(value: string) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusBadgeClass(status: string) {
  if (status === "CONFIRMED") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (status === "CANCELLED") {
    return "bg-red-100 text-red-700";
  }
  return "bg-amber-100 text-amber-700";
}

export default async function SalesOrderDetailPage({ params, searchParams }: SalesOrderDetailPageProps) {
  const { id } = await params;
  const { success, error, product, available, requested } = await searchParams;
  const order = await getSalesOrderById(id);

  if (!order) {
    notFound();
  }

  const stockErrorMessage =
    error === "insufficient-stock"
      ? `Stock insuficiente para ${product ?? "producto"}. Disponible: ${available ?? "0"}, solicitado: ${requested ?? "0"}.`
      : null;

  const returnTo = `/dashboard/sales/${order.id}`;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Pedido {order.id.slice(0, 8)}</h2>
          <p className="text-sm text-zinc-600">Cliente: {order.customer.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/sales"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Volver
          </Link>
          {order.status === "DRAFT" ? (
            <>
              <Link
                href={`/dashboard/sales/${order.id}/edit`}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Editar
              </Link>
              <form action={confirmSalesOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="rounded-md border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                >
                  Confirmar
                </button>
              </form>
              <form action={cancelSalesOrderAction}>
                <input type="hidden" name="orderId" value={order.id} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <button
                  type="submit"
                  className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  Cancelar
                </button>
              </form>
            </>
          ) : null}
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

      {stockErrorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{stockErrorMessage}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Estado</h3>
          <p className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}>
            {order.status}
          </p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Subtotal</h3>
          <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(order.subtotal.toString())}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">IVA</h3>
          <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(order.tax.toString())}</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Total</h3>
          <p className="mt-2 text-lg font-semibold text-zinc-900">{formatCurrency(order.total.toString())}</p>
        </article>
      </div>

      <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-900">Informacion del pedido</h3>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Cliente</dt>
            <dd className="mt-1 text-sm text-zinc-900">{order.customer.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Moneda</dt>
            <dd className="mt-1 text-sm text-zinc-900">{order.currency}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Creado</dt>
            <dd className="mt-1 text-sm text-zinc-900">{formatDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Actualizado</dt>
            <dd className="mt-1 text-sm text-zinc-900">{formatDate(order.updatedAt)}</dd>
          </div>
          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-zinc-500">Notas</dt>
            <dd className="mt-1 text-sm text-zinc-900">{order.notes ?? "Sin notas"}</dd>
          </div>
        </dl>
      </article>

      <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Cantidad</th>
              <th className="px-4 py-3 font-medium">Precio unitario</th>
              <th className="px-4 py-3 font-medium">Total linea</th>
            </tr>
          </thead>
          <tbody>
            {order.lines.map((line) => (
              <tr key={line.id} className="border-t border-zinc-100">
                <td className="px-4 py-3 text-zinc-900">{line.product.name}</td>
                <td className="px-4 py-3 text-zinc-700">{line.product.sku}</td>
                <td className="px-4 py-3 text-zinc-700">{line.quantity}</td>
                <td className="px-4 py-3 text-zinc-700">{formatCurrency(line.unitPrice.toString())}</td>
                <td className="px-4 py-3 text-zinc-700">{formatCurrency(line.lineTotal.toString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
}
