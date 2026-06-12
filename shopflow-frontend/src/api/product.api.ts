import api from "./axios";
import type { Product, PaginatedResponse, ProductFilters, ProductImage } from "../types";

export const productApi = {
  getAll: async (filters: Partial<ProductFilters> = {}) => {
    const { data } = await api.get<PaginatedResponse<Product>>("/products", {
      params: filters
    });
    return data;
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get<{ data: Product }>(`/products/${slug}`);
    return data.data;
  },

  create: async (payload: Partial<Product>) => {
    const { data } = await api.post<{ data: Product }>("/products", payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<Product>) => {
    const { data } = await api.put<{ data: Product }>(`/products/${id}`, payload);
    return data.data;
  },

  delete: async (id: number) => {
    await api.delete(`/products/${id}`);
  },

  uploadImages: async (id: number, formData: FormData) => {
    const { data } = await api.post<{ data: ProductImage[] }>(`/products/${id}/images`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return data.data;
  },

  deleteImage: async (productId: number, imageId: number) => {
    await api.delete(`/products/${productId}/images/${imageId}`);
  }
};
