import Link from "next/link";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/sales", label: "Sales" },
  { href: "/dashboard/inventory/adjust", label: "Inventory Adjust" },
];

export function DashboardSidebar() {
  return (
    <aside className="w-full border-b border-zinc-200 bg-white p-4 md:w-64 md:border-r md:border-b-0">
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500">ERPERRA</div>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
