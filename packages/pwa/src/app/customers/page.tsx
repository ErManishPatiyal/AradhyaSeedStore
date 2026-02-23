"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCustomer,
  formatINR,
  getCustomerPayments,
  getCustomersWithBalance,
  recordCustomerPayment,
  updateCustomer,
  type CustomerInsert,
  type CustomerPayment,
  type CustomerWithBalance,
} from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

const emptyForm: CustomerInsert = {
  name: "",
  address: null,
  phone: null,
};

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatPaymentDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default function CustomersPage() {
  const formPanelRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<CustomerWithBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOutstanding, setEditingOutstanding] = useState(0);
  const [form, setForm] = useState<CustomerInsert>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayIsoDate);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const loadCustomers = useCallback(async () => {
    setError(null);
    try {
      const data = await getCustomersWithBalance(getSupabaseClient());
      setCustomers(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPayments = useCallback(async (customerId: string) => {
    setLoadingPayments(true);
    try {
      const data = await getCustomerPayments(getSupabaseClient(), customerId);
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment history");
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function resetPaymentForm() {
    setPaymentAmount("");
    setPaymentDate(todayIsoDate());
    setPaymentNotes("");
    setPayments([]);
  }

  function openAddForm() {
    setEditingId(null);
    setEditingOutstanding(0);
    setForm(emptyForm);
    resetPaymentForm();
    setSuccess(null);
    setShowForm(true);
    requestAnimationFrame(() => {
      formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function openEditForm(customer: CustomerWithBalance) {
    setEditingId(customer.id);
    setEditingOutstanding(customer.outstanding_balance);
    setForm({
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
    });
    resetPaymentForm();
    setSuccess(null);
    setShowForm(true);
    void loadPayments(customer.id);
    requestAnimationFrame(() => {
      formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setEditingOutstanding(0);
    setForm(emptyForm);
    resetPaymentForm();
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Customer name is required");
      return;
    }

    setSubmitting(true);
    try {
      const client = getSupabaseClient();
      if (editingId) {
        await updateCustomer(client, editingId, form);
        setSuccess("Customer updated");
      } else {
        await createCustomer(client, form);
        closeForm();
      }
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save customer");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;

    setError(null);
    setSuccess(null);

    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid payment amount greater than zero");
      return;
    }

    if (amount > editingOutstanding) {
      setError(`Payment cannot exceed outstanding balance of ${formatINR(editingOutstanding)}`);
      return;
    }

    setRecordingPayment(true);
    try {
      const client = getSupabaseClient();
      await recordCustomerPayment(client, {
        customer_id: editingId,
        amount,
        payment_date: paymentDate,
        notes: paymentNotes.trim() || null,
      });

      const updatedCustomers = await loadCustomers();
      const updatedCustomer = updatedCustomers.find((c) => c.id === editingId);
      if (updatedCustomer) {
        setEditingOutstanding(updatedCustomer.outstanding_balance);
      }

      await loadPayments(editingId);
      setPaymentAmount("");
      setPaymentNotes("");
      setSuccess("Payment recorded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setRecordingPayment(false);
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

      {success && (
        <p className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {success}
        </p>
      )}

      {showForm && (
        <div
          ref={formPanelRef}
          className="mb-6 rounded-lg border border-green-200 bg-white p-4"
        >
          <form onSubmit={handleSubmit}>
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

          {editingId && (
            <>
              {editingOutstanding > 0 ? (
                <form onSubmit={handleRecordPayment} className="mt-6 border-t border-green-100 pt-6">
                  <h4 className="mb-1 font-semibold text-green-800">Record Payment</h4>
                  <p className="mb-4 text-sm text-green-600">
                    Outstanding balance: {formatINR(editingOutstanding)}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount received"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="rounded-md border border-green-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="rounded-md border border-green-300 px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="col-span-full rounded-md border border-green-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={recordingPayment}
                      className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
                    >
                      {recordingPayment ? "Recording..." : "Record Payment"}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-6 border-t border-green-100 pt-6 text-sm text-green-600">
                  No outstanding balance to record a payment against.
                </p>
              )}

              <section className="mt-6 border-t border-green-100 pt-6">
                <h4 className="mb-4 font-semibold text-green-800">Payment History</h4>
                {loadingPayments ? (
                  <p className="text-sm text-green-600">Loading payment history...</p>
                ) : payments.length === 0 ? (
                  <p className="text-sm text-green-600">No payments recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-md border border-green-100">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-green-100 bg-green-50">
                        <tr>
                          <th className="px-3 py-2 font-semibold text-green-800">Date</th>
                          <th className="px-3 py-2 font-semibold text-green-800">Amount</th>
                          <th className="px-3 py-2 font-semibold text-green-800">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-green-50">
                            <td className="px-3 py-2">{formatPaymentDate(payment.payment_date)}</td>
                            <td className="px-3 py-2 font-medium">{formatINR(payment.amount)}</td>
                            <td className="px-3 py-2">{payment.notes ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
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
