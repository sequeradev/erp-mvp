import Link from "next/link";

import { cancelSalesOrderAction, confirmSalesOrderAction } from "@/modules/sales/actions";
import { listSalesOrders, sanitizeSalesSearch, sanitizeSalesStatus } from "@/modules/sales/repository";

type SalesPageProps = {
  searchParams: Promise<{
    query?: string;
    status?: string;
    success?: string;
    error?: string;
    product?: string;
    available?: string;
    requested?: string;
  }>;
};

const successMessages: Record<string, string> = {
  confirmed: "Pedido confirmado correctamente.",
  cancelled: "Pedido cancelado correctamente.",
};

const errorMessages: Record<string, string> = {
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

export default async function SalesPage({ searchParams }: SalesPageProps) {
  const { query: rawQuery, status: rawStatus, success, error, product, available, requested } = await searchParams;
  const query = sanitizeSalesSearch(rawQuery);
  const status = sanitizeSalesStatus(rawStatus);

  const orders = await listSalesOrders({
    query,
    status,
  });

  const returnToParams = new URLSearchParams();
  if (query) {
    returnToParams.set("query", query);
  }
  if (status !== "ALL") {
    returnToParams.set("status", status);
  }
  const returnTo = returnToParams.toString() ? `/dashboard/sales?${returnToParams.toString()}` : "/dashboard/sales";

  const stockErrorMessage =
    error === "insufficient-stock"
      ? `Stock insuficiente para ${product ?? "producto"}. Disponible: ${available ?? "0"}, solicitado: ${requested ?? "0"}.`
      : null;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Ventas</h2>
          <p className="text-sm text-zinc-600">Gestiona pedidos de venta y confirmacion de stock.</p>
        </div>
        <Link
          href="/dashboard/sales/new"
          className="inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
        >
          Nuevo pedido
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

      {stockErrorMessage ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{stockErrorMessage}</div>
      ) : null}

      <form action="/dashboard/sales" method="get" className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 md:grid-cols-[1fr_200px_auto_auto]">
          <input
            type="text"
            name="query"
            defaultValue={query}
            placeholder="Buscar por cliente"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          />
          <select
            name="status"
            defaultValue={status}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500"
          >
            <option value="ALL">Todos</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Filtrar
          </button>
          <Link
            href="/dashboard/sales"
            className="rounded-md border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Limpiar
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-50 text-left text-zinc-600">
            <tr>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Lineas</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Creado</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                  No hay pedidos para mostrar.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-zinc-700">{order.customer.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">{order._count.lines}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatCurrency(order.total.toString())}</td>
                  <td className="px-4 py-3 text-zinc-700">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/sales/${order.id}`}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Ver
                      </Link>
                      {order.status === "DRAFT" ? (
                        <>
                          <Link
                            href={`/dashboard/sales/${order.id}/edit`}
                            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
                          >
                            Editar
                          </Link>
                          <form action={confirmSalesOrderAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <button
                              type="submit"
                              className="rounded-md border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                            >
                              Confirmar
                            </button>
                          </form>
                          <form action={cancelSalesOrderAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <input type="hidden" name="returnTo" value={returnTo} />
                            <button
                              type="submit"
                              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50"
                            >
                              Cancelar
                            </button>
                          </form>
                        </>
                      ) : null}
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
