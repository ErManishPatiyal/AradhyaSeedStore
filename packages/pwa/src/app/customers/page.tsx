export default function CustomersPage() {
  const columns = ["Name", "Address", "Phone", "Outstanding Balance"];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-900">Customers</h2>
        <button
          type="button"
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Add Customer
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-green-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-green-200 bg-green-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-semibold text-green-800">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-green-600">
                No customers yet. Connect Supabase to manage customer records.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
