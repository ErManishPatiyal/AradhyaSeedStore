"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  formatINR,
  formatUnit,
  getCustomers,
  getSalesByDateRange,
  validateSaleDateRange,
  type Customer,
  type SaleWithDetails,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatSaleDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default function SalesHistoryPage() {
  const [fromDate, setFromDate] = useState(todayIsoDate);
  const [toDate, setToDate] = useState(todayIsoDate);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const rangeError = useMemo(() => {
    try {
      validateSaleDateRange(fromDate, toDate);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : "Invalid date range";
    }
  }, [fromDate, toDate]);

  const loadSales = useCallback(async () => {
    if (rangeError) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getSalesByDateRange(getSupabaseClient(), fromDate, toDate);
      setSales(data);
      setExpandedSaleId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sales");
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, rangeError]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  useEffect(() => {
    getCustomers(getSupabaseClient())
      .then(setCustomers)
      .catch(() => {});
  }, []);

  const filteredSales = useMemo(
    () => (customerId ? sales.filter((sale) => sale.customer?.id === customerId) : sales),
    [sales, customerId]
  );

  const summary = useMemo(
    () =>
      filteredSales.reduce(
        (acc, sale) => ({
          count: acc.count + 1,
          total: acc.total + sale.total_amount,
          received: acc.received + sale.received_amount,
          balance: acc.balance + sale.balance_amount,
        }),
        { count: 0, total: 0, received: 0, balance: 0 }
      ),
    [filteredSales]
  );

  function setToday() {
    const today = todayIsoDate();
    setFromDate(today);
    setToDate(today);
  }

  function toggleExpanded(saleId: string) {
    setExpandedSaleId((current) => (current === saleId ? null : saleId));
  }

  const columns = ["Date", "Customer", "Total", "Received", "Balance", ""];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-green-900">Sales History</h2>
        <Link
          href="/sales"
          className="rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
        >
          New sale
        </Link>
      </div>

      <section className="mb-4 rounded-lg border border-green-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex flex-col gap-1 text-sm text-green-800">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-green-800">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-green-800">
            Customer
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
            >
              <option value="">All customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={setToday}
              className="rounded-md border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Today
            </button>
            <button
              type="button"
              onClick={loadSales}
              disabled={loading || !!rangeError}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {loading ? "Loading..." : "Load"}
            </button>
          </div>
        </div>
        {rangeError && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{rangeError}</p>
        )}
      </section>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {!rangeError && !loading && (
        <section className="mb-4 grid gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-green-600">Sales</p>
            <p className="font-semibold text-green-900">{summary.count}</p>
          </div>
          <div>
            <p className="text-green-600">Total amount</p>
            <p className="font-semibold text-green-900">{formatINR(summary.total)}</p>
          </div>
          <div>
            <p className="text-green-600">Received</p>
            <p className="font-semibold text-green-900">{formatINR(summary.received)}</p>
          </div>
          <div>
            <p className="text-green-600">Balance</p>
            <p className="font-semibold text-green-900">{formatINR(summary.balance)}</p>
          </div>
        </section>
      )}

      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-green-200 bg-green-50">
            <tr>
              {columns.map((col) => (
                <th key={col || "actions"} className="px-4 py-3 font-semibold text-green-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  Loading sales...
                </td>
              </tr>
            ) : rangeError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  Adjust the date range to view sales.
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  No sales found for this date range.
                </td>
              </tr>
            ) : filteredSales.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  No sales found for this customer.
                </td>
              </tr>
            ) : (
              filteredSales.flatMap((sale) => {
                const isExpanded = expandedSaleId === sale.id;
                const headerRow = (
                  <tr key={sale.id} className="border-b border-green-100">
                    <td className="px-4 py-3">{formatSaleDate(sale.sale_date)}</td>
                    <td className="px-4 py-3 font-medium">{sale.customer?.name ?? "—"}</td>
                    <td className="px-4 py-3">{formatINR(sale.total_amount)}</td>
                    <td className="px-4 py-3">{formatINR(sale.received_amount)}</td>
                    <td className="px-4 py-3 font-medium">{formatINR(sale.balance_amount)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleExpanded(sale.id)}
                        className="text-sm font-medium text-green-700 hover:text-green-900"
                      >
                        {isExpanded ? "Hide items" : "Show items"}
                      </button>
                    </td>
                  </tr>
                );

                if (!isExpanded) {
                  return [headerRow];
                }

                const itemsRow = (
                  <tr key={`${sale.id}-items`} className="border-b border-green-100 bg-green-50/50">
                    <td colSpan={columns.length} className="px-4 py-3">
                      <div className="overflow-x-auto rounded-md border border-green-200 bg-white">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b border-green-200 bg-green-50">
                            <tr>
                              {["Product", "HSN", "Qty", "Rate", "Amount"].map((col) => (
                                <th key={col} className="px-3 py-2 font-semibold text-green-800">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sale.items.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-green-600">
                                  No line items.
                                </td>
                              </tr>
                            ) : (
                              sale.items.map((item) => (
                                <tr key={item.id} className="border-b border-green-100">
                                  <td className="px-3 py-2">{item.product?.name ?? "—"}</td>
                                  <td className="px-3 py-2">{item.hsn_code || "—"}</td>
                                  <td className="px-3 py-2">
                                    {item.quantity}
                                    {item.product?.unit && (
                                      <span className="ml-1 text-xs text-green-600">
                                        {formatUnit(item.product.unit)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-3 py-2">{formatINR(item.rate)}</td>
                                  <td className="px-3 py-2 font-medium">{formatINR(item.amount)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                );

                return [headerRow, itemsRow];
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
