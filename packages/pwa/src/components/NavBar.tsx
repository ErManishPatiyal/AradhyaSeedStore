"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, STORE_INFO } from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/stock", label: "Stock" },
  { href: "/sales", label: "Sales" },
  { href: "/customers", label: "Customers" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";

  async function handleLogout() {
    await signOut(getSupabaseClient());
    router.replace("/login");
  }

  return (
    <header className="border-b border-green-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-green-800">{STORE_INFO.name}</h1>
          <p className="text-xs text-green-600">
            {STORE_INFO.location} · Mob: {STORE_INFO.mobile}
          </p>
        </div>

        {!isLoginPage && (
          <div className="flex items-center gap-2">
            <nav className="flex gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/sales" && pathname.startsWith("/sales/"));

                return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                    isActive
                      ? "bg-green-100 text-green-900"
                      : "text-green-700 hover:bg-green-50"
                  }`}
                >
                  {item.label}
                </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-2 rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
