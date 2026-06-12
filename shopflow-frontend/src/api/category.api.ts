import api from "./axios";
import type { Category, Product } from "../types";

export const categoryApi = {
  getAll: async () => {
    const { data } = await api.get<{ data: Category[] }>("/categories");
    return data.data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<{ data: Category & { products: Product[] } }>(`/categories/${slug}`);
    return data.data;
  },

  create: async (formData: FormData) => {
    const { data } = await api.post<{ data: Category }>("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.data;
  },

  update: async (id: number, formData: FormData) => {
    const { data } = await api.put<{ data: Category }>(`/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/categories/${id}`);
  }
};
