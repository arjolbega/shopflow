import api from "./axios";
import type { PaginatedResponse, Order, OrderStatus, User, Product } from "../types";

export interface AdminAnalytics {
  revenue: {
    total_revenue: string;
    revenue_last_30_days: string;
    revenue_last_7_days: string;
  };
  orders: {
    total_orders: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  users: {
    total_users: number;
    new_last_30_days: number;
    verified_users: number;
  };
  products: {
    total_products: number;
    active_products: number;
    out_of_stock: number;
    low_stock: number;
  };
  revenueChart: { month: string; revenue: string; order_count: number }[];
  topProducts: {
    id: number;
    name: string;
    price: string;
    image: string | null;
    units_sold: number;
    revenue: string;
  }[];
  recentOrders: {
    id: number;
    status: OrderStatus;
    total: string;
    created_at: string;
    email: string;
    first_name: string;
    last_name: string;
  }[];
}

export interface AdminUser extends User {
  order_count: number;
  total_spent: string;
  created_at: string;
}

export interface AdminProduct extends Product {
  primary_image: string | null;
}

export interface AdminOrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export interface AdminUserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "customer" | "admin";
}

export interface AdminProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_active?: boolean;
}

export const adminApi = {
  getAnalytics: async (): Promise<AdminAnalytics> => {
    const { data } = await api.get<{ data: AdminAnalytics }>("/admin/analytics");
    return data.data;
  },

  // Orders
  getOrders: async (params?: AdminOrderQuery) => {
    const { data } = await api.get<
      PaginatedResponse<
        Order & {
          email: string;
          first_name: string;
          last_name: string;
          item_count: number;
        }
      >
    >("/admin/orders", { params });
    return data;
  },

  getOrderById: async (id: number) => {
    const { data } = await api.get<{ data: Order }>(`/admin/orders/${id}`);
    return data.data;
  },

  updateOrderStatus: async (id: number, status: OrderStatus) => {
    const { data } = await api.patch<{ data: { id: number; status: OrderStatus } }>(`/admin/orders/${id}/status`, { status });
    return data.data;
  },

  // Users
  getUsers: async (params?: AdminUserQuery) => {
    const { data } = await api.get<PaginatedResponse<AdminUser>>("/admin/users", { params });
    return data;
  },

  getUserById: async (id: number) => {
    const { data } = await api.get<{ data: AdminUser }>(`/admin/users/${id}`);
    return data.data;
  },

  updateUserRole: async (id: number, role: "customer" | "admin") => {
    const { data } = await api.patch<{ data: { id: number; role: string } }>(`/admin/users/${id}/role`, { role });
    return data.data;
  },

  // Products
  getProducts: async (params?: AdminProductQuery) => {
    const { data } = await api.get<PaginatedResponse<AdminProduct>>("/admin/products", { params });
    return data;
  },

  toggleProduct: async (id: number) => {
    const { data } = await api.patch<{ data: { id: number; is_active: boolean } }>(`/admin/products/${id}/toggle`);
    return data.data;
  }
};
