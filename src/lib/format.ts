/** Prices are stored as integer Taka amounts. en-IN grouping matches BD convention. */
export function formatPrice(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")}`;
}
