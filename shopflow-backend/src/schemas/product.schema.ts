import { z } from "zod";

const productBaseSchema = z.object({
  category_id: z.number().int().positive("Category is required"),
  name: z.string().min(1).max(255),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  compare_price: z.number().positive().optional(),
  stock: z.number().int().min(0),
  sku: z.string().min(1, "SKU is required").max(100),
  is_active: z.boolean(),
  is_featured: z.boolean()
});

export const createProductSchema = productBaseSchema.extend({
  stock: productBaseSchema.shape.stock.default(0),
  is_active: productBaseSchema.shape.is_active.default(true),
  is_featured: productBaseSchema.shape.is_featured.default(false)
});

export const updateProductSchema = productBaseSchema.partial();

export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 12))
    .pipe(z.number().int().min(1).max(100)),
  sortBy: z
    .enum(["created_at", "price", "name", "stock"])
    .optional()
    .transform((v) => v ?? "created_at"),
  order: z
    .enum(["asc", "desc"])
    .optional()
    .transform((v) => v ?? "desc"),
  category: z.string().optional(), // category slug
  search: z.string().optional(), // full-text search
  minPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
  maxPrice: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : v === "false" ? false : undefined)),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === "true" ? true : undefined))
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
