import Link from "next/link";
import { notFound } from "next/navigation";

import { updateProductAction } from "@/modules/products/actions";
import { ProductForm } from "@/modules/products/components/product-form";
import { getProductById } from "@/modules/products/repository";

type EditProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const action = updateProductAction.bind(null, product.id);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Editar producto</h2>
          <p className="text-sm text-zinc-600">Actualiza los datos de {product.name}.</p>
        </div>
        <Link
          href="/dashboard/products"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <ProductForm
        action={action}
        submitLabel="Guardar cambios"
        initialValues={{
          name: product.name,
          sku: product.sku,
          description: product.description,
          price: product.price.toString(),
          cost: product.cost?.toString() ?? null,
          isActive: product.isActive,
        }}
      />
    </section>
  );
}
