import pool from "../config/db";
import { createError } from "../middlewares/errorHandler";
import { buildPagination } from "../utils/pagination";
import { uploadToS3, deleteFromS3 } from "./upload.service";
import { CreateProductInput, UpdateProductInput, ProductQuery } from "../schemas/product.schema";
import { ResultSetHeader } from "mysql2";
import { Product } from "../types";

// ─── Helper: generate slug ────────────────────────────

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-"); // collapse multiple hyphens
}

// ─── Get Products (with filters) ──────────────────────

export async function getProducts(query: ProductQuery) {
  const { page, limit, sortBy, order, category, search, minPrice, maxPrice, inStock, featured } = query;
  // console.log("---get products start---");
  // console.log("page", page);
  // console.log("limit", limit);
  // console.log("sortBy", sortBy);
  // console.log("order", order);
  // console.log("category", category);
  // console.log("search", search);
  // console.log("minPrice", minPrice);
  // console.log("maxPrice", maxPrice);
  // console.log("inStock", inStock);
  // console.log("featured", featured);
  // console.log("---get products end---");

  const { offset, meta } = buildPagination(page, limit);

  const conditions: string[] = ["p.is_active = TRUE"];
  const params: (number | string)[] = [];

  // Category filter
  if (category) {
    conditions.push("c.slug = ?");
    params.push(category);
  }

  // Full-text search
  if (search) {
    conditions.push("MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)");
    params.push(`${search}*`); // wildcard for partial matching
  }

  // Price range
  if (minPrice !== undefined) {
    conditions.push("p.price >= ?");
    params.push(minPrice);
  }
  if (maxPrice !== undefined) {
    conditions.push("p.price <= ?");
    params.push(maxPrice);
  }

  // Stock filter
  if (inStock !== undefined) {
    conditions.push(inStock ? "p.stock > 0" : "p.stock = 0");
  }

  // Featured filter
  if (featured) {
    conditions.push("p.is_featured = TRUE");
  }

  const whereClause = conditions.join(" AND ");

  // Whitelist sortBy — already validated by Zod enum
  const orderClause = `p.${sortBy} ${order.toUpperCase()}`;

  // console.log("whereClause::", whereClause);
  // console.log("orderClause::", orderClause);
  // console.log("params", params);

  // Get total count
  const [countRows] = await pool.execute<any[]>(
    `SELECT COUNT(*) as total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ${whereClause}`,
    params
  );
  // console.log("countRows", countRows);
  // console.log("offset:", offset);

  const total = countRows[0].total;

  // Get products with primary image + category
  const [rows] = await pool.query<Product[]>(
    `SELECT
       p.*,
       c.name as category_name,
       c.slug as category_slug,
       pi.url as primary_image
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     WHERE ${whereClause}
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  // console.log("---get products end---");

  return {
    data: rows,
    pagination: meta(total)
  };
}

// ─── Get Product by Slug ──────────────────────────────

export async function getProductBySlug(slug: string) {
  // Get product + category
  const [rows] = await pool.execute<any[]>(
    `SELECT p.*, c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.slug = ? AND p.is_active = TRUE`,
    [slug]
  );

  const product = (rows as any[])[0];
  if (!product) throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");

  // Get all images
  const [images] = await pool.execute<any[]>("SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC", [product.id]);

  // Get reviews with user info
  const [reviews] = await pool.execute<any[]>(
    `SELECT r.*, u.first_name, u.last_name
     FROM reviews r
     JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ?
     ORDER BY r.created_at DESC`,
    [product.id]
  );

  // Get average rating
  const [ratingRows] = await pool.execute<any[]>("SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE product_id = ?", [product.id]);

  return {
    ...product,
    images,
    reviews,
    avg_rating: parseFloat(ratingRows[0].avg_rating) || 0,
    review_count: ratingRows[0].review_count
  };
}

// ─── Create Product ───────────────────────────────────

export async function createProduct(input: CreateProductInput) {
  const { category_id, name, description, price, compare_price, stock, sku, is_active, is_featured } = input;

  // Check category exists
  const [catRows] = await pool.execute<ResultSetHeader[]>("SELECT id FROM categories WHERE id = ?", [category_id]);
  if (catRows.length === 0) {
    throw createError(404, "CATEGORY_NOT_FOUND", "Category not found");
  }

  // Check SKU uniqueness
  const [skuRows] = await pool.execute<ResultSetHeader[]>("SELECT id FROM products WHERE sku = ?", [sku]);
  if (skuRows.length > 0) {
    throw createError(409, "SKU_TAKEN", "SKU already in use");
  }

  // Generate unique slug
  let slug = generateSlug(name);
  const [slugRows] = await pool.execute<ResultSetHeader[]>("SELECT id FROM products WHERE slug = ?", [slug]);
  if (slugRows.length > 0) {
    slug = `${slug}-${Date.now()}`; // ensure uniqueness
  }

  await pool.execute(
    `INSERT INTO products
     (category_id, name, slug, description, price, compare_price, stock, sku, is_active, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id, name, slug, description, price, compare_price || null, stock, sku, is_active, is_featured]
  );

  return getProductBySlug(slug);
}

// ─── Update Product ───────────────────────────────────

export async function updateProduct(id: number, input: UpdateProductInput) {
  const [rows] = await pool.execute<any[]>("SELECT * FROM products WHERE id = ?", [id]);
  const product = (rows as any[])[0];
  if (!product) throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");

  // Build dynamic SET clause from provided fields only
  const fields: string[] = [];
  const params: any[] = [];

  if (input.name !== undefined) {
    fields.push("name = ?");
    params.push(input.name);
    // Regenerate slug if name changed
    fields.push("slug = ?");
    params.push(generateSlug(input.name));
  }
  if (input.description !== undefined) {
    fields.push("description = ?");
    params.push(input.description);
  }
  if (input.price !== undefined) {
    fields.push("price = ?");
    params.push(input.price);
  }
  if (input.compare_price !== undefined) {
    fields.push("compare_price = ?");
    params.push(input.compare_price);
  }
  if (input.stock !== undefined) {
    fields.push("stock = ?");
    params.push(input.stock);
  }
  if (input.category_id !== undefined) {
    fields.push("category_id = ?");
    params.push(input.category_id);
  }
  if (input.is_active !== undefined) {
    fields.push("is_active = ?");
    params.push(input.is_active);
  }
  if (input.is_featured !== undefined) {
    fields.push("is_featured = ?");
    params.push(input.is_featured);
  }

  if (fields.length === 0) {
    throw createError(400, "NO_FIELDS", "No fields provided to update");
  }

  params.push(id);

  await pool.execute(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, params);

  // Return updated product
  const [updated] = await pool.execute<ResultSetHeader[]>("SELECT * FROM products WHERE id = ?", [id]);
  return updated[0];
}

// ─── Delete Product ───────────────────────────────────

export async function deleteProduct(id: number) {
  // Get images to delete from S3
  const [images] = await pool.execute<ResultSetHeader[]>("SELECT url FROM product_images WHERE product_id = ?", [id]);

  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM products WHERE id = ?", [id]);

  if (result.affectedRows === 0) {
    throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  // Delete images from S3 after DB delete succeeds
  await Promise.all(
    (images as any[]).map((img) => deleteFromS3(img.url).catch(() => {}))
    // catch silently — DB record is gone, S3 cleanup is best-effort
  );
}

// ─── Upload Images ────────────────────────────────────

export async function uploadProductImages(productId: number, files: Express.Multer.File[]) {
  // Check product exists
  const [rows] = await pool.execute<ResultSetHeader[]>("SELECT id FROM products WHERE id = ?", [productId]);
  if (rows.length === 0) {
    throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  // Check if this product already has a primary image
  const [existingPrimary] = await pool.execute<ResultSetHeader[]>("SELECT id FROM product_images WHERE product_id = ? AND is_primary = TRUE", [productId]);
  const hasPrimary = existingPrimary.length > 0;

  // Get current max sort_order
  const [orderRows] = await pool.execute<any[]>("SELECT COALESCE(MAX(sort_order), 0) as max_order FROM product_images WHERE product_id = ?", [productId]);
  let sortOrder = (orderRows as any[])[0].max_order;

  // Upload all files to S3 in parallel
  const uploadedImages = await Promise.all(
    files.map(async (file, index) => {
      const url = await uploadToS3(file, "products");
      const isPrimary = !hasPrimary && index === 0; // first image becomes primary if none exists
      sortOrder++;

      const [result] = await pool.execute<ResultSetHeader>("INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES (?, ?, ?, ?)", [productId, url, isPrimary, sortOrder]);

      return {
        id: result.insertId,
        url,
        is_primary: isPrimary,
        sort_order: sortOrder
      };
    })
  );

  return uploadedImages;
}

// ─── Delete Image ─────────────────────────────────────

export async function deleteProductImage(productId: number, imageId: number) {
  const [rows] = await pool.execute<any[]>("SELECT * FROM product_images WHERE id = ? AND product_id = ?", [imageId, productId]);
  const image = (rows as any[])[0];

  if (!image) throw createError(404, "IMAGE_NOT_FOUND", "Image not found");

  await pool.execute("DELETE FROM product_images WHERE id = ?", [imageId]);
  await deleteFromS3(image.url);

  // If deleted image was primary, promote the next image
  if (image.is_primary) {
    await pool.execute(
      `UPDATE product_images SET is_primary = TRUE
       WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1`,
      [productId]
    );
  }

  return { message: "Image deleted" };
}
