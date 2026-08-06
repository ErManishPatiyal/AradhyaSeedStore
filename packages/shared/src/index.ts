// Types
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductUnit,
  Customer,
  CustomerInsert,
  CustomerUpdate,
  CustomerWithBalance,
  Sale,
  SaleItem,
  SaleItemInput,
  CreateSaleInput,
  StockMovement,
  StockMovementType,
  StockReferenceType,
} from "./types";
export { STORE_INFO } from "./types";

// Supabase
export {
  createSupabaseClient,
  validateSupabaseConfig,
  type TypedSupabaseClient,
  type SupabaseConfig,
} from "./supabase/client";
export type { Database } from "./supabase/database";

// API
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  getCustomersWithBalance,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getSales,
  createSale,
} from "./api";

export { signInWithPassword, signOut, getSession } from "./api/auth";

// Utils
export {
  calcLineAmount,
  calcTotalAmount,
  calcBalance,
  formatINR,
  formatUnit,
  isValidHsnCode,
  isValidUnit,
  wouldStockGoNegative,
  roundCurrency,
} from "./utils/calculations";
