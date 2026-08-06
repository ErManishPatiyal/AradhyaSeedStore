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
  CustomerPayment,
  CustomerPaymentInsert,
  Sale,
  SaleItem,
  SaleItemWithProduct,
  SaleWithDetails,
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
  getCustomerPayments,
  recordCustomerPayment,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getSales,
  getSalesByDateRange,
  validateSaleDateRange,
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
