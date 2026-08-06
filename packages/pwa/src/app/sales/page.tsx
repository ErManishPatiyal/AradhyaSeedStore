"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calcBalance,
  calcLineAmount,
  calcTotalAmount,
  createSale,
  formatINR,
  formatUnit,
  getCustomers,
  getProducts,
  wouldStockGoNegative,
  type Customer,
  type Product,
  type SaleItemInput,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

interface LineItemRow {
  key: string;
  product_id: string;
  hsn_code: string;
  quantity: number;
  rate: number;
}

function emptyLineItem(): LineItemRow {
  return {
    key: crypto.randomUUID(),
    product_id: "",
    hsn_code: "",
    quantity: 1,
    rate: 0,
  };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export default function SalesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [saleDate, setSaleDate] = useState(todayIsoDate());
  const [receivedAmount, setReceivedAmount] = useState(0);
  const [lineItems, setLineItems] = useState<LineItemRow[]>([emptyLineItem()]);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const client = getSupabaseClient();
      const [customerData, productData] = await Promise.all([
        getCustomers(client),
        getProducts(client),
      ]);
      setCustomers(customerData);
      setProducts(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sale data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const saleItems: SaleItemInput[] = useMemo(
    () =>
      lineItems
        .filter((item) => item.product_id && item.quantity > 0)
        .map((item) => ({
          product_id: item.product_id,
          hsn_code: item.hsn_code,
          quantity: item.quantity,
          rate: item.rate,
        })),
    [lineItems]
  );

  const totalAmount = calcTotalAmount(saleItems);
  const balanceAmount = calcBalance(totalAmount, receivedAmount);

  function updateLineItem(key: string, updates: Partial<LineItemRow>) {
    setLineItems((items) =>
      items.map((item) => (item.key === key ? { ...item, ...updates } : item))
    );
  }

  function handleProductChange(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateLineItem(key, {
      product_id: productId,
      hsn_code: product?.hsn_code ?? "",
    });
  }

  function addLineItem() {
    setLineItems((items) => [...items, emptyLineItem()]);
  }

  function removeLineItem(key: string) {
    setLineItems((items) => {
      if (items.length === 1) return items;
      return items.filter((item) => item.key !== key);
    });
  }

  function resetForm() {
    setCustomerId("");
    setSaleDate(todayIsoDate());
    setReceivedAmount(0);
    setLineItems([emptyLineItem()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!customerId) {
      setError("Please select a customer");
      return;
    }
    if (saleItems.length === 0) {
      setError("Add at least one line item with quantity and rate");
      return;
    }

    for (const item of saleItems) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        setError("Selected product not found");
        return;
      }
      if (wouldStockGoNegative(product.stock_qty, item.quantity)) {
        setError(`Insufficient stock for ${product.name}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      await createSale(getSupabaseClient(), {
        customer_id: customerId,
        sale_date: saleDate,
        items: saleItems,
        received_amount: receivedAmount,
      });
      setSuccess("Sale saved successfully. Stock has been updated.");
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save sale");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-green-600">Loading sale form...</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-900">New Sale</h2>
        <Link
          href="/sales/history"
          className="rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
        >
          View sales
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>
      )}

      <section className="mb-4 rounded-lg border border-green-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-green-800">Customer Name &amp; Address</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="rounded-md border border-green-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={saleDate}
            onChange={(e) => setSaleDate(e.target.value)}
            className="rounded-md border border-green-300 px-3 py-2 text-sm"
            required
          />
        </div>
        {selectedCustomer && (
          <p className="mt-2 text-sm text-green-600">
            {selectedCustomer.address ?? "No address on file"}
            {selectedCustomer.phone ? ` · ${selectedCustomer.phone}` : ""}
          </p>
        )}
      </section>

      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-green-800">Line Items</h3>
        <button
          type="button"
          onClick={addLineItem}
          className="rounded-md border border-green-300 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50"
        >
          Add Line
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-green-200 bg-green-50">
            <tr>
              {["Product", "HSN", "Qty", "Rate", "Amount", ""].map((col) => (
                <th key={col || "actions"} className="px-4 py-3 font-semibold text-green-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              const amount = item.product_id
                ? calcLineAmount(item.quantity, item.rate)
                : 0;

              return (
                <tr key={item.key} className="border-b border-green-100">
                  <td className="px-4 py-3">
                    <select
                      value={item.product_id}
                      onChange={(e) => handleProductChange(item.key, e.target.value)}
                      className="w-full min-w-40 rounded-md border border-green-300 px-2 py-1.5"
                      required
                    >
                      <option value="">Select product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.stock_qty} {formatUnit(p.unit)})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">{item.hsn_code || "—"}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.key, { quantity: Number(e.target.value) })
                      }
                      className="w-24 rounded-md border border-green-300 px-2 py-1.5"
                      required
                    />
                    {product && (
                      <span className="ml-1 text-xs text-green-600">
                        {formatUnit(product.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateLineItem(item.key, { rate: Number(e.target.value) })
                      }
                      className="w-28 rounded-md border border-green-300 px-2 py-1.5"
                      required
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{formatINR(amount)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.key)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="mt-4 flex flex-col items-end gap-4 sm:flex-row sm:justify-between">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-green-700 px-6 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Saving..." : "Save Sale"}
        </button>

        <div className="w-full max-w-xs space-y-2 rounded-lg border border-green-200 bg-white p-4">
          <div className="flex justify-between text-sm">
            <span>Total Amount</span>
            <span className="font-medium">{formatINR(totalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Received Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(Number(e.target.value))}
              className="w-28 rounded-md border border-green-300 px-2 py-1 text-right text-sm"
            />
          </div>
          <div className="flex justify-between border-t border-green-200 pt-2 text-sm font-semibold">
            <span>Balance Amount</span>
            <span>{formatINR(balanceAmount)}</span>
          </div>
        </div>
      </section>
    </form>
  );
}
