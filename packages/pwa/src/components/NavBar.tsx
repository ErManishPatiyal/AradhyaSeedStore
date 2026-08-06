import Link from "next/link";
import { STORE_INFO } from "@aradhya/shared";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/stock", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/customers", label: "Customers" },
];

export function NavBar() {
  return (
    <header className="border-b border-green-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-green-800">{STORE_INFO.name}</h1>
          <p className="text-xs text-green-600">
            {STORE_INFO.location} · Mob: {STORE_INFO.mobile}
          </p>
        </div>
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
