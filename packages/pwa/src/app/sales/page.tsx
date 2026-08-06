export default function SalesPage() {
  const lineColumns = ["Product", "HSN", "Qty", "Rate", "Amount"];

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold text-green-900">New Sale</h2>

      <section className="mb-4 rounded-lg border border-green-200 bg-white p-4">
        <h3 className="mb-2 font-semibold text-green-800">Customer Name &amp; Address</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Customer name"
            className="rounded-md border border-green-300 px-3 py-2 text-sm"
            disabled
          />
          <input
            type="text"
            placeholder="Address"
            className="rounded-md border border-green-300 px-3 py-2 text-sm"
            disabled
          />
        </div>
      </section>

      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-green-200 bg-green-50">
            <tr>
              {lineColumns.map((col) => (
                <th key={col} className="px-4 py-3 font-semibold text-green-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={lineColumns.length} className="px-4 py-6 text-center text-green-600">
                Add line items after connecting Supabase.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="mt-4 flex justify-end">
        <div className="w-full max-w-xs space-y-2 rounded-lg border border-green-200 bg-white p-4">
          <div className="flex justify-between text-sm">
            <span>Total Amount</span>
            <span className="font-medium">₹0.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Received Amount</span>
            <span className="font-medium">₹0.00</span>
          </div>
          <div className="flex justify-between border-t border-green-200 pt-2 text-sm font-semibold">
            <span>Balance Amount</span>
            <span>₹0.00</span>
          </div>
        </div>
      </section>
    </div>
  );
}
