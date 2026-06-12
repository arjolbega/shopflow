import { ResultSetHeader } from "mysql2";
import pool from "../config/db";
import { createError } from "../middlewares/errorHandler";
import { AddToCartInput, UpdateCartInput } from "../schemas/cart.schema";
import { GetCart, Product } from "../types";

// ─── Get Cart ─────────────────────────────────────────

export async function getCart(userId: number) {
  const [rows] = await pool.execute<GetCart[]>(
    `SELECT
       ci.id,
       ci.quantity,
       ci.created_at,
       p.id as product_id,
       p.name,
       p.slug,
       p.price,
       p.compare_price,
       p.stock,
       pi.url as image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );

  const items = rows;

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal: parseFloat(subtotal.toFixed(2)),
    itemCount
  };
}

// ─── Add to Cart ──────────────────────────────────────

export async function addToCart(userId: number, input: AddToCartInput) {
  const { product_id, quantity } = input;

  // Verify product exists and is active
  const [productRows] = await pool.execute<Product[]>("SELECT * FROM products WHERE id = ? AND is_active = TRUE", [product_id]);
  const product = productRows[0];

  if (!product) {
    throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");
  }

  // Check stock
  if (product.stock < quantity) {
    throw createError(400, "INSUFFICIENT_STOCK", `Only ${product.stock} item(s) available`);
  }

  // Check if already in cart — if so, increment quantity
  const [existing] = await pool.execute<GetCart[]>("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, product_id]);

  if (existing.length > 0) {
    const currentItem = existing[0];
    const newQuantity = currentItem.quantity + quantity;

    // Validate combined quantity against stock
    if (newQuantity > product.stock) {
      throw createError(400, "INSUFFICIENT_STOCK", `Cannot add ${quantity} more. Only ${product.stock - currentItem.quantity} additional item(s) available`);
    }

    await pool.execute("UPDATE cart_items SET quantity = ? WHERE id = ?", [newQuantity, currentItem.id]);
  } else {
    // Insert new cart item
    // UNIQUE KEY on (user_id, product_id) prevents duplicates at DB level
    await pool.execute("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)", [userId, product_id, quantity]);
  }

  return getCart(userId);
}

// ─── Update Cart Item Quantity ────────────────────────

export async function updateCartItem(userId: number, productId: number, input: UpdateCartInput) {
  const { quantity } = input;

  // Verify item belongs to this user
  const [rows] = await pool.execute<GetCart[]>("SELECT ci.*, p.stock FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.user_id = ? AND ci.product_id = ?", [userId, productId]);
  const item = rows[0];

  if (!item) {
    throw createError(404, "CART_ITEM_NOT_FOUND", "Item not found in cart");
  }

  // Check stock
  if (quantity > item.stock) {
    throw createError(400, "INSUFFICIENT_STOCK", `Only ${item.stock} item(s) available`);
  }

  await pool.execute("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, userId, productId]);

  return getCart(userId);
}

// ─── Remove Cart Item ─────────────────────────────────

export async function removeFromCart(userId: number, productId: number) {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [userId, productId]);

  if (result.affectedRows === 0) {
    throw createError(404, "CART_ITEM_NOT_FOUND", "Item not found in cart");
  }

  return getCart(userId);
}

// ─── Clear Cart ───────────────────────────────────────

export async function clearCart(userId: number) {
  await pool.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);
}
