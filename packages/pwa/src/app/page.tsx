import Link from "next/link";
import { STORE_INFO } from "@aradhya/shared";

const quickLinks = [
  {
    href: "/stock",
    title: "Stock Register",
    description: "View and manage seed inventory (HSN, qty, MFG/exp dates)",
  },
  {
    href: "/sales",
    title: "New Sale",
    description: "Create customer bill with line items and payment tracking",
  },
  {
    href: "/customers",
    title: "Customers",
    description: "Customer list and outstanding balance",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-green-900">Dashboard</h2>
      <p className="mb-6 text-green-700">
        Welcome to {STORE_INFO.name}. Select a module below.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-green-200 bg-white p-4 shadow-sm transition hover:border-green-400 hover:shadow-md"
          >
            <h3 className="font-semibold text-green-800">{link.title}</h3>
            <p className="mt-1 text-sm text-green-600">{link.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold text-amber-800">Scaffold Status</h3>
        <p className="mt-1 text-sm text-amber-700">
          Phase 1 scaffold — UI placeholders only. Connect Supabase env vars to enable data.
        </p>
      </section>
    </div>
  );
}
