/** Weight or volume unit for seed products. */
export type ProductUnit = "kg" | "ltr";

/** Product in the stock register. */
export interface Product {
  id: string;
  name: string;
  hsn_code: string;
  unit: ProductUnit;
  stock_qty: number;
  mfg_date: string | null;
  exp_date: string | null;
  created_at: string;
}

export type ProductInsert = Omit<Product, "id" | "created_at">;
export type ProductUpdate = Partial<ProductInsert>;

/** Customer for billing. */
export interface Customer {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export type CustomerInsert = Omit<Customer, "id" | "created_at">;
export type CustomerUpdate = Partial<CustomerInsert>;

/** Customer with aggregated outstanding balance from sales. */
export interface CustomerWithBalance extends Customer {
  outstanding_balance: number;
}

/** Sale invoice header. */
export interface Sale {
  id: string;
  customer_id: string;
  sale_date: string;
  total_amount: number;
  received_amount: number;
  balance_amount: number;
  created_at: string;
}

/** Line item on a sale invoice. */
export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  hsn_code: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Input for creating a sale line (no id yet). */
export interface SaleItemInput {
  product_id: string;
  hsn_code: string;
  quantity: number;
  rate: number;
}

/** Input for creating a full sale. */
export interface CreateSaleInput {
  customer_id: string;
  sale_date: string;
  items: SaleItemInput[];
  received_amount: number;
}

/** Stock movement audit trail. */
export type StockMovementType = "in" | "out";
export type StockReferenceType = "sale" | "purchase" | "adjustment";

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reference_type: StockReferenceType | null;
  reference_id: string | null;
  created_at: string;
}

/** Store constants for invoices and UI headers. */
export const STORE_INFO = {
  name: "ARADHYA SEED STORE",
  location: "Chhatter",
  mobile: "70180 63629",
} as const;
