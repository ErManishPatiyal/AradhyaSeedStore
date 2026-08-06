import type { TypedSupabaseClient } from "../supabase/client";
import type {
  CreateSaleInput,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  Product,
  ProductInsert,
  ProductUpdate,
  Sale,
} from "../types";
import { calcBalance, calcLineAmount, calcTotalAmount } from "../utils/calculations";

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

// ─── Sales ────────────────────────────────────────────────────────────────────

export async function getSales(client: TypedSupabaseClient): Promise<Sale[]> {
  const { data, error } = await client
    .from("sales")
    .select("*")
    .order("sale_date", { ascending: false });

  if (error) throw error;
  return data ?? [];
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
