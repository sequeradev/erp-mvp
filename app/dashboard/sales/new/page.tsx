import Link from "next/link";

import { createSalesOrderAction } from "@/modules/sales/actions";
import { SalesOrderForm } from "@/modules/sales/components/sales-order-form";
import { listCustomersForSalesForm, listProductsForSalesForm } from "@/modules/sales/repository";

export default async function NewSalesOrderPage() {
  const [customers, products] = await Promise.all([listCustomersForSalesForm(), listProductsForSalesForm()]);

  if (customers.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900">Nuevo pedido de venta</h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
          No hay clientes disponibles. Crea clientes antes de registrar ventas.
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900">Nuevo pedido de venta</h2>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-700 shadow-sm">
          No hay productos disponibles. Crea productos antes de registrar ventas.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Nuevo pedido de venta</h2>
          <p className="text-sm text-zinc-600">Selecciona cliente y agrega lineas de productos.</p>
        </div>
        <Link
          href="/dashboard/sales"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <SalesOrderForm
        action={createSalesOrderAction}
        submitLabel="Guardar pedido en draft"
        customers={customers}
        products={products.map((product) => ({
          ...product,
          price: product.price.toString(),
        }))}
      />
    </section>
  );
}
