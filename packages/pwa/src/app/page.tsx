"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatINR,
  getCustomersWithBalance,
  getProducts,
  getSales,
  STORE_INFO,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [productCount, setProductCount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [todaySalesCount, setTodaySalesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const client = getSupabaseClient();
        const [products, customers, sales] = await Promise.all([
          getProducts(client),
          getCustomersWithBalance(client),
          getSales(client),
        ]);

        const today = todayIsoDate();
        setProductCount(products.length);
        setTotalOutstanding(
          customers.reduce((sum, customer) => sum + customer.outstanding_balance, 0)
        );
        setTodaySalesCount(sales.filter((sale) => sale.sale_date === today).length);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-green-900">Dashboard</h2>
      <p className="mb-6 text-green-700">
        Welcome to {STORE_INFO.name}. Select a module below.
      </p>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-green-200 bg-white p-4">
          <p className="text-sm text-green-600">Products in stock</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {loading ? "—" : productCount}
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-white p-4">
          <p className="text-sm text-green-600">Total outstanding</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {loading ? "—" : formatINR(totalOutstanding)}
          </p>
        </div>
        <div className="rounded-lg border border-green-200 bg-white p-4">
          <p className="text-sm text-green-600">Today&apos;s sales</p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {loading ? "—" : todaySalesCount}
          </p>
        </div>
      </div>

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
    </div>
  );
}
