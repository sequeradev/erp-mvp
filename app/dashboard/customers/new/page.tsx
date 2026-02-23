import Link from "next/link";

import { createCustomerAction } from "@/modules/customers/actions";
import { CustomerForm } from "@/modules/customers/components/customer-form";

export default function NewCustomerPage() {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Nuevo cliente</h2>
          <p className="text-sm text-zinc-600">Completa los datos para registrar un cliente.</p>
        </div>
        <Link
          href="/dashboard/customers"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Volver
        </Link>
      </div>

      <CustomerForm action={createCustomerAction} submitLabel="Crear cliente" />
    </section>
  );
}
