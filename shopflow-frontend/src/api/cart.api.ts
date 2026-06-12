import api from "./axios";
import type { Cart } from "../types";

export const cartApi = {
  get: async () => {
    const { data } = await api.get<{ data: Cart }>("/cart");
    return data.data;
  },

  add: async (product_id: number, quantity: number = 1) => {
    const { data } = await api.post<{ data: Cart }>("/cart", { product_id, quantity });
    return data.data;
  },

  update: async (productId: number, quantity: number) => {
    const { data } = await api.patch<{ data: Cart }>(`/cart/${productId}`, { quantity });
    return data.data;
  },

  remove: async (productId: number) => {
    const { data } = await api.delete<{ data: Cart }>(`/cart/${productId}`);
    return data.data;
  },

  clear: async () => {
    await api.delete("/cart");
  }
};
