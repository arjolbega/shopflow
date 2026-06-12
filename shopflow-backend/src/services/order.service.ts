import pool from "../config/db";
import stripe from "../config/stripe";
import mailer from "../config/mailer";
import { createError } from "../middlewares/errorHandler";
import { buildPagination } from "../utils/pagination";
import { orderConfirmationTemplate } from "../utils/email-templates/order-confirmation";
import { CreateOrderInput, OrderQuery } from "../schemas/order.schema";
import { ResultSetHeader } from "mysql2";
import { GetCart, Order, OrderItems, OrdersTotal, UserOrder, UserWithOrder } from "../types";
import { SHIPPING_COST, SHIPPING_THRESHOLD, TAX_RATE } from "../constants";
import { isCartEmpty, formatPrice, productStockIsLessThanCartQuantity } from "../utils/helpers";

// ─── Create Order + Payment Intent ───────────────────

export async function createOrder(userId: number, input: CreateOrderInput) {
  const { shipping_address, notes } = input;

  // Get user's cart
  const [cartItems] = await pool.execute<GetCart[]>(
    `SELECT
       ci.quantity,
       p.id as product_id,
       p.name,
       p.price,
       p.stock,
       p.is_active,
       pi.url as image
     FROM cart_items ci
     JOIN products p ON p.id = ci.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     WHERE ci.user_id = ?`,
    [userId]
  );

  if (isCartEmpty(cartItems)) {
    throw createError(400, "EMPTY_CART", "Your cart is empty");
  }

  // ── Stock validation (final check before payment) ──
  const stockErrors: string[] = [];
  for (const item of cartItems) {
    if (!item.is_active) {
      stockErrors.push(`"${item.name}" is no longer available`);
    } else if (productStockIsLessThanCartQuantity(item)) {
      stockErrors.push(`"${item.name}" only has ${item.stock} item(s) left`);
    }
  }
  if (stockErrors.length > 0) {
    throw createError(400, "STOCK_ERROR", stockErrors.join(". "));
  }

  // ── Calculate totals ───────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + parseFloat(item.price) * item.quantity;
  }, 0);

  const shippingCost = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const tax = parseFloat(((subtotal + shippingCost) * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + shippingCost + tax).toFixed(2));

  // ── Create Stripe PaymentIntent ────────────────────
  // Amount in cents — Stripe always uses smallest currency unit
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100),
    currency: "usd",
    metadata: { userId: String(userId) },
    automatic_payment_methods: { enabled: true }
  });

  // ── Create Order in DB (transaction) ──────────────
  const connection = await pool.getConnection();
  let orderId: number;

  try {
    await connection.beginTransaction();

    // Insert order
    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders
       (user_id, subtotal, shipping_cost, tax, total, stripe_payment_id, stripe_status, shipping_address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, subtotal.toFixed(2), shippingCost.toFixed(2), tax, total, paymentIntent.id, paymentIntent.status, JSON.stringify(shipping_address), notes || null]
    );

    orderId = orderResult.insertId;

    // Insert order items (snapshots)
    for (const item of cartItems) {
      const itemSubtotal = parseFloat(item.price) * item.quantity;
      await connection.execute(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.image || null, item.price, item.quantity, itemSubtotal.toFixed(2)]
      );
    }

    // Reserve stock — decrement immediately
    // This prevents overselling during payment processing window
    for (const item of cartItems) {
      await connection.execute("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?", [item.quantity, item.product_id, item.quantity]);
    }

    // Clear the cart
    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    // Cancel the PaymentIntent if DB transaction failed
    await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
    throw err;
  } finally {
    connection.release();
  }

  return {
    orderId,
    clientSecret: paymentIntent.client_secret, // sent to frontend for Stripe.js
    total,
    subtotal,
    shippingCost,
    tax
  };
}

// ─── Stripe Webhook ───────────────────────────────────
// Called by Stripe when payment succeeds/fails

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch {
    throw createError(400, "INVALID_WEBHOOK", "Webhook signature verification failed");
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    await handlePaymentSuccess(paymentIntent);
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    await handlePaymentFailure(paymentIntent);
  }

  return { received: true };
}

async function handlePaymentSuccess(paymentIntent: any) {
  // Find order by Stripe payment ID
  const [rows] = await pool.execute<UserWithOrder[]>(
    `SELECT o.*, u.email, u.first_name FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.stripe_payment_id = ?`,
    [paymentIntent.id]
  );
  const order = rows[0];
  if (!order) return;

  // Update order status
  await pool.execute(`UPDATE orders SET status = 'processing', stripe_status = ? WHERE id = ?`, [paymentIntent.status, order.id]);

  // Get order items for email
  const [items] = await pool.execute<OrderItems[]>("SELECT * FROM order_items WHERE order_id = ?", [order.id]);
  console.log("---test---");

  // Send confirmation email
  const { subject, html } = orderConfirmationTemplate({
    firstName: order.first_name,
    orderId: order.id,
    items,
    subtotal: formatPrice(order.subtotal),
    shippingCost: formatPrice(order.shipping_cost),
    tax: formatPrice(order.tax),
    total: formatPrice(order.total),
    shippingAddress: order.shipping_address
  });

  await mailer
    .sendMail({
      from: process.env.SMTP_FROM,
      to: order.email,
      subject,
      html
    })
    .catch((err) => {
      // Log but don't throw — order is confirmed, email failure shouldn't break the webhook
      console.error("[EMAIL ERROR] Order confirmation failed:", err.message);
    });
}

async function handlePaymentFailure(paymentIntent: any) {
  const [rows] = await pool.execute<Order[]>("SELECT * FROM orders WHERE stripe_payment_id = ?", [paymentIntent.id]);
  const order = rows[0];
  if (!order) return;

  // Get order items to restore stock
  const [items] = await pool.execute<OrderItems[]>("SELECT * FROM order_items WHERE order_id = ?", [order.id]);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Mark order as cancelled
    await connection.execute(`UPDATE orders SET status = 'cancelled', stripe_status = ? WHERE id = ?`, [paymentIntent.status, order.id]);

    // Restore stock
    for (const item of items) {
      await connection.execute("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// ─── Get User Orders ──────────────────────────────────

export async function getUserOrders(userId: number, query: OrderQuery) {
  const { page, limit, status } = query;
  const { offset, meta } = buildPagination(page, limit);

  const conditions: string[] = ["o.user_id = ?"];
  const params: (string | number)[] = [userId];

  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }
  console.log("params", params);
  console.log("limit", limit);
  console.log("offset", offset);
  console.log("\n");

  const whereClause = conditions.join(" AND ");

  const [countRows] = await pool.execute<OrdersTotal[]>(`SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`, params);
  const total = countRows[0].total;
  console.log("total", total);

  const [rows] = await pool.query<UserOrder[]>(
    `SELECT
       o.id, o.status, o.subtotal, o.shipping_cost,
       o.tax, o.total, o.created_at, o.stripe_payment_id,
       COUNT(oi.id) as item_count
     FROM orders o
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  console.log("rows", rows);
  console.log("\n");

  return { data: rows, pagination: meta(total) };
}

// ─── Get Single Order ─────────────────────────────────

export async function getOrderById(orderId: number, userId: number) {
  const [rows] = await pool.execute<Order[]>("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
  const order = rows[0];

  // user_id check prevents IDOR — users can only see their own orders
  if (!order) throw createError(404, "ORDER_NOT_FOUND", "Order not found");

  const [items] = await pool.execute<OrderItems[]>("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

  return {
    ...order,
    shipping_address: order.shipping_address,
    items
  };
}

// ─── Cancel Order ─────────────────────────────────────

export async function cancelOrder(orderId: number, userId: number) {
  const [rows] = await pool.execute<Order[]>("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
  const order = rows[0];

  if (!order) throw createError(404, "ORDER_NOT_FOUND", "Order not found");

  // Only pending orders can be cancelled by the user
  if (!["pending", "processing"].includes(order.status)) {
    throw createError(400, "CANNOT_CANCEL", `Order cannot be cancelled — current status is "${order.status}"`);
  }

  const [items] = await pool.execute<OrderItems[]>("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(`UPDATE orders SET status = 'cancelled' WHERE id = ?`, [orderId]);

    // Restore stock
    for (const item of items) {
      await connection.execute("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  // Refund via Stripe if already paid
  if (order.stripe_payment_id && order.status === "processing") {
    await stripe.refunds
      .create({
        payment_intent: order.stripe_payment_id
      })
      .catch((err) => {
        console.error("[STRIPE] Refund failed:", err.message);
      });
  }

  return { message: "Order cancelled successfully" };
}

export const getPaymentIntent = async (orderId: number, userId: number) => {
  const [rows] = await pool.execute<Order[]>(`SELECT * FROM orders WHERE id = ? AND user_id = ?`, [orderId, userId]);

  const order = rows[0];

  if (!order) throw createError(404, "ORDER_NOT_FOUND", "Order not found");

  if (order.status !== "pending") {
    throw createError(400, "ORDER_NOT_PENDING", "Order is no longer pending payment");
  }

  if (!order.stripe_payment_id) {
    throw createError(400, "NO_PAYMENT_INTENT", "No payment intent found for this order");
  }

  // Retrieve existing PaymentIntent from Stripe — don't create a new one
  const paymentIntent = await stripe.paymentIntents.retrieve(order.stripe_payment_id);

  return {
    clientSecret: paymentIntent.client_secret
  };
};
