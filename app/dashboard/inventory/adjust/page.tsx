import Link from "next/link";

import { createInventoryAdjustmentAction } from "@/modules/inventory/actions";
import { InventoryAdjustForm } from "@/modules/inventory/components/inventory-adjust-form";
import { listProductsForInventoryAdjust } from "@/modules/inventory/repository";

type InventoryAdjustPageProps = {
  searchParams: Promise<{
    success?: string;
    productId?: string;
  }>;
};

export default async function InventoryAdjustPage({ searchParams }: InventoryAdjustPageProps) {
  const { success, productId } = await searchParams;
  const products = await listProductsForInventoryAdjust();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Ajuste de inventario</h2>
          <p className="text-sm text-zinc-600">Registra movimientos de tipo ADJUSTMENT para corregir stock.</p>
        </div>
        <Link
          href="/dashboard/products"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Ver productos
        </Link>
      </div>

      {success === "adjusted" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Ajuste registrado correctamente.
        </div>
      ) : null}

      <InventoryAdjustForm action={createInventoryAdjustmentAction} products={products} selectedProductId={productId} />
    </section>
  );
}
