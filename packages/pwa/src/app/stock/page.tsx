"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createProduct,
  formatUnit,
  getProducts,
  isValidHsnCode,
  isValidUnit,
  updateProduct,
  type Product,
  type ProductInsert,
  type ProductUnit,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

type ProductFormState = Omit<ProductInsert, "stock_qty"> & { stock_qty: number | "" };

const emptyForm: ProductFormState = {
  name: "",
  hsn_code: "",
  unit: "kg",
  stock_qty: "",
  mfg_date: null,
  exp_date: null,
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN");
}

function isExpiringWithinMonths(expDate: string | null, months: number) {
  if (!expDate) return false;
  const exp = new Date(expDate);
  if (Number.isNaN(exp.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() + months);
  return exp <= cutoff;
}

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setError(null);
    try {
      const data = await getProducts(getSupabaseClient());
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      hsn_code: product.hsn_code,
      unit: product.unit,
      stock_qty: product.stock_qty,
      mfg_date: product.mfg_date,
      exp_date: product.exp_date,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!isValidHsnCode(form.hsn_code)) {
      setError("HSN code is required");
      return;
    }
    if (!isValidUnit(form.unit)) {
      setError("Unit must be kg or ltr");
      return;
    }

    setSubmitting(true);
    try {
      const client = getSupabaseClient();
      const payload: ProductInsert = {
        ...form,
        stock_qty: Number(form.stock_qty),
      };
      if (editingId) {
        await updateProduct(client, editingId, payload);
      } else {
        await createProduct(client, payload);
      }
      closeForm();
      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = ["Sr.", "Product", "HSN", "Qty", "Unit", "MFG Date", "Exp Date", ""];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-900">Stock Register</h2>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Add Product
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-green-200 bg-white p-4"
        >
          <h3 className="mb-4 font-semibold text-green-800">
            {editingId ? "Edit Product" : "Add Product"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Product name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="HSN code"
              value={form.hsn_code}
              onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
              required
            />
            <select
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value as ProductUnit })}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
            >
              <option value="kg">Kg</option>
              <option value="ltr">Ltr</option>
            </select>
            <input
              type="number"
              min="0"
              step="0.001"
              placeholder="Stock quantity"
              value={form.stock_qty}
              onChange={(e) =>
                setForm({ ...form, stock_qty: e.target.value as number | "" })
              }
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
              required
            />
            <label className="flex items-center gap-3 text-sm text-green-800">
              <span className="shrink-0">Manufacturing date</span>
              <input
                type="date"
                value={form.mfg_date ?? ""}
                onChange={(e) =>
                  setForm({ ...form, mfg_date: e.target.value || null })
                }
                className="min-w-0 flex-1 rounded-md border border-green-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-green-800">
              <span className="shrink-0">Expiry date</span>
              <input
                type="date"
                value={form.exp_date ?? ""}
                onChange={(e) =>
                  setForm({ ...form, exp_date: e.target.value || null })
                }
                className="min-w-0 flex-1 rounded-md border border-green-300 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
            >
              Cancel
            </button>
          </div>
        </form>
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
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  No products yet. Add your first stock entry.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.id}
                  className={
                    isExpiringWithinMonths(product.exp_date, 6)
                      ? "border-b border-red-200 bg-red-50"
                      : "border-b border-green-100"
                  }
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.hsn_code}</td>
                  <td className="px-4 py-3">{product.stock_qty}</td>
                  <td className="px-4 py-3">{formatUnit(product.unit)}</td>
                  <td className="px-4 py-3">{formatDate(product.mfg_date)}</td>
                  <td className="px-4 py-3">{formatDate(product.exp_date)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(product)}
                      className="text-sm font-medium text-green-700 hover:text-green-900"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
