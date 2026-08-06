// Types
export type {
  Product,
  ProductInsert,
  ProductUpdate,
  ProductUnit,
  Customer,
  CustomerInsert,
  CustomerUpdate,
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
  getCustomers,
  createCustomer,
  updateCustomer,
  getSales,
  createSale,
} from "./api";

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
