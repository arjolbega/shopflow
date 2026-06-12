import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";
export type SortBy = "created_at" | "price" | "name" | "stock";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "customer" | "admin";
  two_fa_enabled: boolean;
  is_verified: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  product_count?: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  primary_image: string | null;
  images?: ProductImage[];
  reviews?: Review[];
  avg_rating?: number;
  review_count?: number;
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  name: string;
  slug: string;
  price: string;
  compare_price: string | null;
  stock: number;
  quantity: number;
  image: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image: string | null;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  shipping_address: ShippingAddress;
  notes: string | null;
  stripe_payment_id: string | null;
  item_count?: number;
  items?: OrderItem[];
  created_at: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";

export interface ShippingAddress {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiError {
  error: {
    status: number;
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface ProductFilters {
  page: number;
  limit: number;
  sortBy: "created_at" | "price" | "name" | "stock";
  order: "asc" | "desc";
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  search?: string;
}

export interface RefreshToken {
  accessToken: string;
}

export interface CartTotal {
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export type CheckoutStep = "address" | "payment" | "success";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: string;
}
