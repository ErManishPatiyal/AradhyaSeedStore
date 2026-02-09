import type { TypedSupabaseClient } from "../supabase/client";
import type {
  CreateSaleInput,
  Customer,
  CustomerInsert,
  CustomerPayment,
  CustomerPaymentInsert,
  CustomerUpdate,
  CustomerWithBalance,
  Product,
  ProductInsert,
  ProductUpdate,
  Sale,
  SaleWithDetails,
} from "../types";
import { calcBalance, calcLineAmount, calcTotalAmount, roundCurrency } from "../utils/calculations";

// ─── Products ───────────────────────────────────────────────────────────────

export async function getProducts(client: TypedSupabaseClient): Promise<Product[]> {
  const { data, error } = await client
    .from("products")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(
  client: TypedSupabaseClient,
  id: string
): Promise<Product | null> {
  const { data, error } = await client.from("products").select("*").eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createProduct(
  client: TypedSupabaseClient,
  product: ProductInsert
): Promise<Product> {
  const { data, error } = await client.from("products").insert(product).select().single();

  if (error) throw error;
  return data;
}

export async function updateProduct(
  client: TypedSupabaseClient,
  id: string,
  updates: ProductUpdate
): Promise<Product> {
  const { data, error } = await client
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(client: TypedSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) throw error;
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomers(client: TypedSupabaseClient): Promise<Customer[]> {
  const { data, error } = await client
    .from("customers")
    .select("*")
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function createCustomer(
  client: TypedSupabaseClient,
  customer: CustomerInsert
): Promise<Customer> {
  const { data, error } = await client.from("customers").insert(customer).select().single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(
  client: TypedSupabaseClient,
  id: string,
  updates: CustomerUpdate
): Promise<Customer> {
  const { data, error } = await client
    .from("customers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCustomer(client: TypedSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function getCustomersWithBalance(
  client: TypedSupabaseClient
): Promise<CustomerWithBalance[]> {
  const [customers, sales, payments] = await Promise.all([
    getCustomers(client),
    getSales(client),
    getAllCustomerPayments(client),
  ]);

  const balanceByCustomer = new Map<string, number>();
  for (const sale of sales) {
    const current = balanceByCustomer.get(sale.customer_id) ?? 0;
    balanceByCustomer.set(sale.customer_id, current + sale.balance_amount);
  }

  const paymentsByCustomer = new Map<string, number>();
  for (const payment of payments) {
    const current = paymentsByCustomer.get(payment.customer_id) ?? 0;
    paymentsByCustomer.set(payment.customer_id, current + payment.amount);
  }

  return customers.map((customer) => {
    const saleBalance = balanceByCustomer.get(customer.id) ?? 0;
    const paidAmount = paymentsByCustomer.get(customer.id) ?? 0;
    const outstanding = Math.max(0, roundCurrency(saleBalance - paidAmount));

    return {
      ...customer,
      outstanding_balance: outstanding,
    };
  });
}

// ─── Customer Payments ────────────────────────────────────────────────────────

async function getAllCustomerPayments(
  client: TypedSupabaseClient
): Promise<CustomerPayment[]> {
  const { data, error } = await client
    .from("customer_payments")
    .select("*")
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getCustomerPayments(
  client: TypedSupabaseClient,
  customerId: string
): Promise<CustomerPayment[]> {
  const { data, error } = await client
    .from("customer_payments")
    .select("*")
    .eq("customer_id", customerId)
    .order("payment_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function recordCustomerPayment(
  client: TypedSupabaseClient,
  payment: CustomerPaymentInsert
): Promise<CustomerPayment> {
  if (payment.amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const customersWithBalance = await getCustomersWithBalance(client);
  const customer = customersWithBalance.find((c) => c.id === payment.customer_id);

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (payment.amount > customer.outstanding_balance) {
    throw new Error(
      `Payment amount cannot exceed outstanding balance of ${customer.outstanding_balance}`
    );
  }

  const { data, error } = await client
    .from("customer_payments")
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function getSales(client: TypedSupabaseClient): Promise<Sale[]> {
  const { data, error } = await client
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

const MAX_SALE_DATE_RANGE_DAYS = 31;

function parseIsoDate(isoDate: string): Date {
  const parts = isoDate.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

function daysBetweenInclusive(fromDate: string, toDate: string): number {
  const from = parseIsoDate(fromDate);
  const to = parseIsoDate(toDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay) + 1;
}

export function validateSaleDateRange(fromDate: string, toDate: string): void {
  if (fromDate > toDate) {
    throw new Error("From date must be on or before to date");
  }
  if (daysBetweenInclusive(fromDate, toDate) > MAX_SALE_DATE_RANGE_DAYS) {
    throw new Error(`Date range cannot exceed ${MAX_SALE_DATE_RANGE_DAYS} days`);
  }
}

export async function getSalesByDateRange(
  client: TypedSupabaseClient,
  fromDate: string,
  toDate: string
): Promise<SaleWithDetails[]> {
  validateSaleDateRange(fromDate, toDate);

  const { data, error } = await client
    .from("sales")
    .select(
      `
      *,
      customer:customers(id, name),
      items:sale_items(
        *,
        product:products(id, name, unit)
      )
    `
    )
    .gte("sale_date", fromDate)
    .lte("sale_date", toDate)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as SaleWithDetails[];
}

/**
 * Creates a sale atomically via Postgres RPC.
 * The DB function handles stock deduction and rejects negative stock.
 */
export async function createSale(
  client: TypedSupabaseClient,
  input: CreateSaleInput
): Promise<string> {
  const totalAmount = calcTotalAmount(input.items);
  const balanceAmount = calcBalance(totalAmount, input.received_amount);

  const itemsPayload = input.items.map((item) => ({
    product_id: item.product_id,
    hsn_code: item.hsn_code,
    quantity: item.quantity,
    rate: item.rate,
    amount: calcLineAmount(item.quantity, item.rate),
  }));

  const { data, error } = await client.rpc("create_sale_with_items", {
    p_customer_id: input.customer_id,
    p_sale_date: input.sale_date,
    p_items: itemsPayload,
    p_received_amount: input.received_amount,
  });

  if (error) throw error;
  if (!data) throw new Error("create_sale_with_items returned no sale id");

  // balance is persisted by the RPC; expose via return id for now
  void balanceAmount;
  return data;
}

/**
 * Deletes a sale atomically via Postgres RPC.
 * The DB function reverts stock quantities and logs restock movements.
 */
export async function deleteSale(
  client: TypedSupabaseClient,
  saleId: string
): Promise<void> {
  const { error } = await client.rpc("delete_sale_with_items", {
    p_sale_id: saleId,
  });

  if (error) throw error;
}

/**
 * Deletes a single line item atomically via Postgres RPC.
 * The DB function reverts stock, recomputes sale totals, and refuses
 * to remove the last item on a sale. Returns the sale id.
 */
export async function deleteSaleItem(
  client: TypedSupabaseClient,
  saleItemId: string
): Promise<string> {
  const { data, error } = await client.rpc("delete_sale_item", {
    p_sale_item_id: saleItemId,
  });

  if (error) throw error;
  if (!data) throw new Error("delete_sale_item returned no sale id");
  return data;
}
