import api from "./axios";
import type { Order, PaginatedResponse, ShippingAddress } from "../types";

export const orderApi = {
  create: async (payload: { shipping_address: ShippingAddress; notes?: string }) => {
    const { data } = await api.post<{
      data: {
        orderId: number;
        clientSecret: string;
        total: number;
        subtotal: number;
        shippingCost: number;
        tax: number;
      };
    }>("/orders", payload);
    return data.data;
  },

  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get<PaginatedResponse<Order>>("/orders", { params });
    return data;
  },

  getById: async (id: number) => {
    const { data } = await api.get<{ data: Order }>(`/orders/${id}`);
    return data.data;
  },

  cancel: async (id: number) => {
    const { data } = await api.patch<{ data: { message: string } }>(`/orders/${id}/cancel`);
    return data.data;
  },
  getPaymentIntent: async (id: number) => {
    const { data } = await api.get<{ data: { clientSecret: string } }>(`/orders/${id}/payment-intent`);
    return data.data;
  }
};
