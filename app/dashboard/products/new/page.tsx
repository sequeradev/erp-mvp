import Link from "next/link";

import { createProductAction } from "@/modules/products/actions";
import { ProductForm } from "@/modules/products/components/product-form";

export default function NewProductPage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Nuevo producto</h2>
          <p className="text-sm text-zinc-600">Completa los datos para registrar un producto.</p>
        </div>
        <Link
          href="/dashboard/products"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <ProductForm action={createProductAction} submitLabel="Crear producto" />
    </section>
  );
}
