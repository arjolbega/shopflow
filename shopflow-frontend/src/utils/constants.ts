import type { ProductFilters, SortBy, SortDirection } from "../types";

export const WRAPPER_STYLES = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

export const navLinks = [
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Featured", href: "/products?featured=true" }
];

export const STATS = [
  { value: "10k+", label: "Products" },
  { value: "50k+", label: "Happy customers" },
  { value: "4.9★", label: "Average rating" }
];

export const DEFAULT_FILTERS: ProductFilters = {
  page: 1,
  limit: 12,
  sortBy: "created_at",
  order: "desc"
};

export const VALID_SORT_BY: SortBy[] = ["created_at", "price", "name", "stock"];
export const VALID_ORDERS: SortDirection[] = ["asc", "desc"];

export const stockOptions = [
  { label: "All products", value: undefined },
  { label: "In stock only", value: true },
  { label: "Out of stock", value: false }
];

export const SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 5.99;
export const TAX_RATE = 0.08;

export const CHECKOUT_STEPS = ["address", "payment"];

export const ORDER_STATUSES = [
  { key: "pending", label: "Pending", color: "bg-warning" },
  { key: "processing", label: "Processing", color: "bg-info" },
  { key: "shipped", label: "Shipped", color: "bg-accent" },
  { key: "delivered", label: "Delivered", color: "bg-success" },
  { key: "cancelled", label: "Cancelled", color: "bg-error" }
];
