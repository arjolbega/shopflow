import { Request } from "express";
import { RowDataPacket } from "mysql2";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: "customer" | "admin";
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: "customer" | "admin";
}

export interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "customer" | "admin";
  is_verified: boolean;
  two_fa_secret: string | null;
  two_fa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy: string;
  order: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RefreshToken extends RowDataPacket {
  id: number;
  user_id: number;
  token: string;
  family: string;
  expires_at: Date;
  revoked: boolean;
}

export interface GetCart extends RowDataPacket {
  id: number;
  quantity: number;
  created_at: Date;
  product_id: number;
  name: string;
  slug: string;
  price: string;
  compare_price?: string;
  stock: number;
  image: string;
  is_active: boolean;
}

export interface Product extends RowDataPacket {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string;
  stock: number;
  sku: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface OrdersTotal extends RowDataPacket {
  total: number;
}

export const statuses = ["pending", "processing", "completed", "failed"] as const;

type OrderStatus = (typeof statuses)[number];

export interface UserOrder extends RowDataPacket {
  id: number;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  created_at: Date;
  item_count: number;
}

export interface Order extends RowDataPacket {
  id: number;
  user_id: number;
  status: OrderStatus;
  subtotal: string;
  shipping_cost: string;
  tax: string;
  total: string;
  stripe_payment_id: string;
  stripe_status: string;
  shipping_address: {
    address: string;
    full_name: string;
    city: string;
    line1: string;
    line2?: string;
    postal_code: string;
    state: string;
    country: string;
    notes: string;
    created_at: Date;
    updated_at: Date;
  };
}

export interface UsersOrders extends User, Order {}

export interface OrderItems extends RowDataPacket {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: string;
  quantity: string;
  subtotal: string;
}

export interface UserWithOrder extends Order {
  email: string;
  first_name: string;
}

export interface AdminRevenue extends RowDataPacket {
  total_revenue: string;
  revenue_last_30_days: string;
  revenue_last_7_days: string;
}

export interface AdminOrders extends RowDataPacket {
  total_orders: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

export interface AdminCustomerUsers extends RowDataPacket {
  total_users: number;
  new_last_30_days: number;
  verified_users: number;
}

export interface AdminProducts extends RowDataPacket {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
}

export interface AdminRevenueChart extends RowDataPacket {
  month: string;
  revenue: string;
  order_count: number;
}

export interface AdminTopProducts extends RowDataPacket {
  id: number;
  name: string;
  price: string;
  image: string | null;
  units_sold: number;
  revenue: string;
}

export interface AdminRecentOrders extends RowDataPacket {
  id: number;
  status: OrderStatus;
  total: string;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AdminTotalQuery extends RowDataPacket {
  total: number;
}
