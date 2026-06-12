import { z } from "zod";

export const addToCartSchema = z.object({
  product_id: z.number().int().positive("Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1)
});

export const updateCartSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1")
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartInput = z.infer<typeof updateCartSchema>;
