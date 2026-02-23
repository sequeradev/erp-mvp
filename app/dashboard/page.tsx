export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-900">ERP MVP base listo</h2>
      <p className="text-sm text-zinc-600">
        Esta vista contiene solo infraestructura tecnica. Los modulos de negocio se agregaran despues.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Estado Auth</h3>
          <p className="mt-2 text-sm text-zinc-600">Proteccion activa por middleware con sesion placeholder.</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Base de datos</h3>
          <p className="mt-2 text-sm text-zinc-600">Prisma + PostgreSQL listos para migraciones y seed.</p>
        </article>
        <article className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-medium text-zinc-900">Siguiente modulo</h3>
          <p className="mt-2 text-sm text-zinc-600">Customers CRUD ya disponible en el menu lateral.</p>
        </article>
      </div>
    </section>
  );
}
