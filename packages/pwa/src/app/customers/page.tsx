"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createCustomer,
  formatINR,
  getCustomersWithBalance,
  updateCustomer,
  type CustomerInsert,
  type CustomerWithBalance,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

const emptyForm: CustomerInsert = {
  name: "",
  address: null,
  phone: null,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerInsert>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setError(null);
    try {
      const data = await getCustomersWithBalance(getSupabaseClient());
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(customer: CustomerWithBalance) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
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
      setError("Customer name is required");
      return;
    }

    setSubmitting(true);
    try {
      const client = getSupabaseClient();
      if (editingId) {
        await updateCustomer(client, editingId, form);
      } else {
        await createCustomer(client, form);
      }
      closeForm();
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  }

  const columns = ["Name", "Address", "Phone", "Outstanding Balance", ""];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-900">Customers</h2>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Add Customer
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
            {editingId ? "Edit Customer" : "Add Customer"}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Customer name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
              className="rounded-md border border-green-300 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address ?? ""}
              onChange={(e) => setForm({ ...form, address: e.target.value || null })}
              className="col-span-full rounded-md border border-green-300 px-3 py-2 text-sm"
            />
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
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                  No customers yet. Add your first customer.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b border-green-100">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.address ?? "—"}</td>
                  <td className="px-4 py-3">{customer.phone ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatINR(customer.outstanding_balance)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(customer)}
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
