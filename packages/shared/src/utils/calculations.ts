import type { ProductUnit, SaleItemInput } from "../types";

const CURRENCY_DECIMALS = 2;

/** Round to 2 decimal places for INR amounts. */
export function roundCurrency(value: number): number {
  const factor = 10 ** CURRENCY_DECIMALS;
  return Math.round(value * factor) / factor;
}

/** Line amount = quantity × rate. */
export function calcLineAmount(quantity: number, rate: number): number {
  return roundCurrency(quantity * rate);
}

/** Sum of all line amounts. */
export function calcTotalAmount(items: Pick<SaleItemInput, "quantity" | "rate">[]): number {
  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  return roundCurrency(total);
}

/** Balance owed = total − received. */
export function calcBalance(totalAmount: number, receivedAmount: number): number {
  return roundCurrency(totalAmount - receivedAmount);
}

/** Format amount as INR string (e.g. "₹1,250.00"). */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Display label for product unit. */
export function formatUnit(unit: ProductUnit): string {
  return unit === "kg" ? "Kg" : "Ltr";
}

/** Validate HSN code is non-empty (basic check; extend for GST format later). */
export function isValidHsnCode(hsn: string): boolean {
  return hsn.trim().length > 0;
}

/** Validate unit string. */
export function isValidUnit(unit: string): unit is ProductUnit {
  return unit === "kg" || unit === "ltr";
}

/** Check if stock would go negative after a sale. */
export function wouldStockGoNegative(currentStock: number, saleQuantity: number): boolean {
  return currentStock - saleQuantity < 0;
}
