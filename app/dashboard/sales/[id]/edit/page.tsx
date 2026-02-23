import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { updateSalesOrderAction } from "@/modules/sales/actions";
import { SalesOrderForm } from "@/modules/sales/components/sales-order-form";
import { getSalesOrderById, listCustomersForSalesForm, listProductsForSalesForm } from "@/modules/sales/repository";

type EditSalesOrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSalesOrderPage({ params }: EditSalesOrderPageProps) {
  const { id } = await params;
  const [order, customers, products] = await Promise.all([
    getSalesOrderById(id),
    listCustomersForSalesForm(),
    listProductsForSalesForm(),
  ]);

  if (!order) {
    notFound();
  }

  if (order.status !== "DRAFT") {
    redirect(`/dashboard/sales/${order.id}?error=not-draft-edit`);
  }

  const action = updateSalesOrderAction.bind(null, order.id);

  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Editar pedido de venta</h2>
          <p className="text-sm text-zinc-600">Solo los pedidos en DRAFT se pueden editar.</p>
        </div>
        <Link
          href={`/dashboard/sales/${order.id}`}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <SalesOrderForm
        action={action}
        submitLabel="Guardar cambios"
        customers={customers}
        products={products.map((product) => ({
          ...product,
          price: product.price.toString(),
        }))}
        initialValues={{
          customerId: order.customerId,
          notes: order.notes,
          currency: order.currency,
          lines: order.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice.toString(),
          })),
        }}
      />
    </section>
  );
}
