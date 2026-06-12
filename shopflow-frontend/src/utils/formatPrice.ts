export function formatPrice(amount: number | string, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(Number(amount));
}

export function formatDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}
