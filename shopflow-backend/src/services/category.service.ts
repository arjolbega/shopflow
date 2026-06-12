import pool from "../config/db";
import { createError } from "../middlewares/errorHandler";
import { uploadToS3, deleteFromS3 } from "./upload.service";
import { CreateCategoryInput, UpdateCategoryInput } from "../schemas/category.schema";
import { ResultSetHeader } from "mysql2";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Get All Categories ───────────────────────────────

export async function getCategories() {
  const [rows] = await pool.execute<any[]>(
    `SELECT
       c.*,
       COUNT(p.id) as product_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.is_active = TRUE
     GROUP BY c.id
     ORDER BY c.name ASC`
  );
  return rows;
}

// ─── Get Category by Slug ─────────────────────────────

export async function getCategoryBySlug(slug: string) {
  const [rows] = await pool.execute<ResultSetHeader[]>("SELECT * FROM categories WHERE slug = ?", [slug]);
  const category = (rows as any[])[0];
  if (!category) throw createError(404, "CATEGORY_NOT_FOUND", "Category not found");

  // Get active products in this category with primary image
  const [products] = await pool.execute<ResultSetHeader[]>(
    `SELECT
       p.*,
       pi.url as primary_image
     FROM products p
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     WHERE p.category_id = ? AND p.is_active = TRUE
     ORDER BY p.created_at DESC`,
    [category.id]
  );

  return { ...category, products };
}

// ─── Create Category ──────────────────────────────────

export async function createCategory(input: CreateCategoryInput, imageFile?: Express.Multer.File) {
  const { name, description } = input;

  // Check duplicate name
  const [existing] = await pool.execute<ResultSetHeader[]>("SELECT id FROM categories WHERE name = ?", [name]);

  if (existing.length > 0) {
    throw createError(409, "CATEGORY_EXISTS", "Category name already in use");
  }

  let slug = generateSlug(name);
  const [slugRows] = await pool.execute<ResultSetHeader[]>("SELECT id FROM categories WHERE slug = ?", [slug]);
  if (slugRows.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  // Upload image if provided
  let image_url: string | null = input.image_url || null;
  if (imageFile) {
    image_url = await uploadToS3(imageFile, "categories");
  }

  const [result] = await pool.execute<ResultSetHeader>("INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)", [name, slug, description || null, image_url]);

  const [newCategory] = await pool.execute<ResultSetHeader[]>("SELECT * FROM categories WHERE id = ?", [result.insertId]);

  return newCategory[0];
}

// ─── Update Category ──────────────────────────────────

export async function updateCategory(id: number, input: UpdateCategoryInput, imageFile?: Express.Multer.File) {
  const [rows] = await pool.execute<any[]>("SELECT * FROM categories WHERE id = ?", [id]);
  const category = (rows as any[])[0];
  if (!category) throw createError(404, "CATEGORY_NOT_FOUND", "Category not found");

  const fields: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
    fields.push("slug = ?");
    params.push(generateSlug(input.name));
  }

  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description);
  }

  // Handle image upload
  if (imageFile) {
    // Delete old image from S3 if exists
    if (category.image_url) {
      await deleteFromS3(category.image_url).catch(() => {});
    }
    const newImageUrl = await uploadToS3(imageFile, "categories");
    fields.push("image_url = ?");
    params.push(newImageUrl);
  } else if (input.image_url !== undefined) {
    fields.push("image_url = ?");
    params.push(input.image_url);
  }

  if (fields.length === 0) {
    throw createError(400, "NO_FIELDS", "No fields provided to update");
  }

  params.push(id);

  await pool.execute(`UPDATE categories SET ${fields.join(", ")} WHERE id = ?`, params);

  const [updated] = await pool.execute<any[]>("SELECT * FROM categories WHERE id = ?", [id]);
  return (updated as any[])[0];
}

// ─── Delete Category ──────────────────────────────────

export async function deleteCategory(id: number) {
  // Check if category has products
  const [productRows] = await pool.execute<any[]>("SELECT COUNT(*) as count FROM products WHERE category_id = ?", [id]);
  const productCount = (productRows as any[])[0].count;

  if (productCount > 0) {
    throw createError(409, "CATEGORY_HAS_PRODUCTS", `Cannot delete category with ${productCount} product(s). Reassign or delete products first.`);
  }

  const [rows] = await pool.execute<any[]>("SELECT * FROM categories WHERE id = ?", [id]);
  const category = (rows as any[])[0];
  if (!category) throw createError(404, "CATEGORY_NOT_FOUND", "Category not found");

  await pool.execute("DELETE FROM categories WHERE id = ?", [id]);

  // Delete category image from S3
  if (category.image_url) {
    await deleteFromS3(category.image_url).catch(() => {});
  }
}
