import Link from "next/link";
import { notFound } from "next/navigation";

import { updateCustomerAction } from "@/modules/customers/actions";
import { CustomerForm } from "@/modules/customers/components/customer-form";
import { getCustomerById } from "@/modules/customers/repository";

type EditCustomerPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params;
  const customer = await getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const action = updateCustomerAction.bind(null, customer.id);

  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Editar cliente</h2>
          <p className="text-sm text-zinc-600">Actualiza los datos de {customer.name}.</p>
        </div>
        <Link
          href="/dashboard/customers"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <CustomerForm
        action={action}
        submitLabel="Guardar cambios"
        initialValues={{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
        }}
      />
    </section>
  );
}
