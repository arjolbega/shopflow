import pool from "../config/db";
import { createError } from "../middlewares/errorHandler";
import { buildPagination } from "../utils/pagination";
import { AdminOrderQuery, AdminUserQuery, AdminProductQuery, UpdateOrderStatusInput, UpdateUserRoleInput } from "../schemas/admin.schema";
import { AdminCustomerUsers, AdminOrders, AdminProducts, AdminTotalQuery, AdminRecentOrders, AdminRevenue, AdminRevenueChart, AdminTopProducts, Order, Product, UsersOrders, UserWithOrder } from "../types";
import stripe from "../config/stripe";
import mailer from "../config/mailer";
import { orderCancelTemplate } from "../utils/email-templates/order-cancel";
import { orderShippedTemplate } from "../utils/email-templates/order-shipped";

// ─── Analytics ────────────────────────────────────────

export async function getAnalytics() {
  // ── Revenue ───────────────────────────────────────
  const [revenueRows] = await pool.execute<AdminRevenue[]>(
    `SELECT
       COALESCE(SUM(total), 0) as total_revenue,
       COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN total ELSE 0 END), 0) as revenue_last_30_days,
       COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
         THEN total ELSE 0 END), 0) as revenue_last_7_days
     FROM orders
     WHERE status NOT IN ('cancelled', 'refunded')`
  );
  console.log("---admin---");
  console.log("revenueRows", revenueRows);

  // ── Orders ────────────────────────────────────────
  const [orderRows] = await pool.execute<AdminOrders[]>(
    `SELECT
       COUNT(*) as total_orders,
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
       SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
       SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
       SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
     FROM orders`
  );
  console.log("orderRows", orderRows);

  // ── Users ─────────────────────────────────────────
  const [userRows] = await pool.execute<AdminCustomerUsers[]>(
    `SELECT
       COUNT(*) as total_users,
       SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         THEN 1 ELSE 0 END) as new_last_30_days,
       SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verified_users
     FROM users
     WHERE role = 'customer'`
  );
  console.log("userRows", userRows);

  // ── Products ──────────────────────────────────────
  const [productRows] = await pool.execute<AdminProducts[]>(
    `SELECT
       COUNT(*) as total_products,
       SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_products,
       SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock,
       SUM(CASE WHEN stock > 0 AND stock <= 5 THEN 1 ELSE 0 END) as low_stock
     FROM products`
  );
  console.log("productRows", productRows);

  // ── Revenue Chart (last 12 months) ────────────────
  const [chartRows] = await pool.execute<AdminRevenueChart[]>(
    `SELECT
       DATE_FORMAT(created_at, '%Y-%m') as month,
       COALESCE(SUM(total), 0) as revenue,
       COUNT(*) as order_count
     FROM orders
     WHERE
       status NOT IN ('cancelled', 'refunded')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
     GROUP BY DATE_FORMAT(created_at, '%Y-%m')
     ORDER BY month ASC`
  );
  console.log("chartRows", chartRows);

  // ── Top Products (by revenue) ─────────────────────
  const [topProducts] = await pool.execute<AdminTopProducts[]>(
    `SELECT
       p.id,
       p.name,
       p.price,
       MAX(pi.url) AS image,
       SUM(oi.quantity) as units_sold,
       SUM(oi.subtotal) as revenue
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status NOT IN ('cancelled', 'refunded')
     GROUP BY p.id
     ORDER BY revenue DESC
     LIMIT 5`
  );
  console.log("topProducts", topProducts);

  // ── Recent Orders ─────────────────────────────────
  const [recentOrders] = await pool.execute<AdminRecentOrders[]>(
    `SELECT
       o.id, o.status, o.total, o.created_at,
       u.email, u.first_name, u.last_name
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC
     LIMIT 5`
  );
  console.log("recentOrders", recentOrders);
  console.log("\n");

  return {
    revenue: revenueRows[0],
    orders: orderRows[0],
    users: userRows[0],
    products: productRows[0],
    revenueChart: chartRows,
    topProducts,
    recentOrders
  };
}

// ─── Admin Orders ─────────────────────────────────────

export async function getAdminOrders(query: AdminOrderQuery) {
  const { page, limit, status, search } = query;
  const { offset, meta } = buildPagination(page, limit);

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (status) {
    conditions.push("o.status = ?");
    params.push(status);
  }

  if (search) {
    conditions.push("(u.email LIKE ? OR o.id = ?)");
    params.push(`%${search}%`, parseInt(search) || 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.execute<any[]>(
    `SELECT COUNT(*) as total
     FROM orders o
     JOIN users u ON u.id = o.user_id
     ${whereClause}`,
    params
  );
  const total = (countRows as any[])[0].total;

  const [rows] = await pool.query<any[]>(
    `SELECT
       o.*,
       u.email,
       u.first_name,
       u.last_name,
       COUNT(oi.id) as item_count
     FROM orders o
     JOIN users u ON u.id = o.user_id
     LEFT JOIN order_items oi ON oi.order_id = o.id
     ${whereClause}
     GROUP BY o.id
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, pagination: meta(total) };
}

export async function getAdminOrderById(orderId: number) {
  const [rows] = await pool.execute<any[]>(
    `SELECT o.*, u.email, u.first_name, u.last_name
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [orderId]
  );
  const order = (rows as any[])[0];
  if (!order) throw createError(404, "ORDER_NOT_FOUND", "Order not found");

  const [items] = await pool.execute<any[]>("SELECT * FROM order_items WHERE order_id = ?", [orderId]);

  return {
    ...order,
    shipping_address: JSON.parse(order.shipping_address),
    items
  };
}

export async function updateOrderStatus(orderId: number, input: UpdateOrderStatusInput) {
  const [rows] = await pool.execute<UserWithOrder[]>(
    `SELECT o.*, u.email, u.first_name FROM orders o
    JOIN users u ON u.id = o.user_id WHERE o.id = ?`,
    [orderId]
  );
  const order = rows[0];

  if (!order) throw createError(404, "ORDER_NOT_FOUND", "Order not found");

  if (order.status === input.status) {
    throw createError(400, "SAME_STATUS", `Order is already ${input.status}`);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update status
    await connection.execute("UPDATE orders SET status = ? WHERE id = ?", [input.status, orderId]);

    // ── Cancellation side effects ──────────────────
    if (input.status === "cancelled" || input.status === "refunded") {
      // Only restore stock if order was not already cancelled
      const wasActive = !["cancelled", "refunded"].includes(order.status);

      if (wasActive) {
        // Get order items to restore stock
        const [items] = await connection.execute<any[]>("SELECT product_id, quantity FROM order_items WHERE order_id = ?", [orderId]);

        // Restore stock for each item
        for (const item of items as any[]) {
          await connection.execute("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.product_id]);
        }
      }

      // Issue Stripe refund if payment was processed
      if (order.stripe_payment_id && ["processing", "shipped", "delivered"].includes(order.status)) {
        try {
          await stripe.refunds.create({
            payment_intent: order.stripe_payment_id,
            reason: "requested_by_customer"
          });
        } catch (stripeErr: any) {
          // Log but don't fail the transaction
          // Admin should handle manually if Stripe refund fails
          console.error("[STRIPE REFUND ERROR]", stripeErr.message);
        }
      }

      const { subject, html } = orderCancelTemplate({ orderId, input, order });

      await mailer
        .sendMail({
          from: process.env.SMTP_FROM,
          to: order.email,
          subject,
          html
        })
        .catch((err) => {
          console.error("[EMAIL ERROR] Cancellation email failed:", err.message);
        });
    }

    if (input.status === "shipped") {
      const { subject, html } = orderShippedTemplate({ orderId, order });

      await mailer
        .sendMail({
          from: process.env.SMTP_FROM,
          to: order.email,
          subject,
          html
        })
        .catch((err) => {
          console.error("[EMAIL ERROR] Shipped email failed:", err.message);
        });
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { id: orderId, status: input.status };
}

// ─── Admin Users ──────────────────────────────────────

export async function getAdminUsers(query: AdminUserQuery) {
  const { page, limit, search, role } = query;
  const { offset, meta } = buildPagination(page, limit);

  const conditions: string[] = [];
  const params: string[] = [];

  if (search) {
    conditions.push("(u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (role) {
    conditions.push("u.role = ?");
    params.push(role);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.execute<AdminTotalQuery[]>(`SELECT COUNT(*) as total FROM users u ${whereClause}`, params);
  const total = countRows[0].total;

  const [rows] = await pool.query<UsersOrders[]>(
    `SELECT
       u.id, u.email, u.first_name, u.last_name,
       u.role, u.is_verified, u.two_fa_enabled,
       u.created_at,
       COUNT(DISTINCT o.id) as order_count,
       COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled','refunded')
         THEN o.total ELSE 0 END), 0) as total_spent
     FROM users u
     LEFT JOIN orders o ON o.user_id = u.id
     ${whereClause}
     GROUP BY u.id
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, pagination: meta(total) };
}

export async function getAdminUserById(userId: number) {
  const [rows] = await pool.execute<any[]>(
    `SELECT
       u.id, u.email, u.first_name, u.last_name,
       u.role, u.is_verified, u.two_fa_enabled, u.created_at
     FROM users u
     WHERE u.id = ?`,
    [userId]
  );
  const user = (rows as any[])[0];
  if (!user) throw createError(404, "USER_NOT_FOUND", "User not found");

  // Get user's recent orders
  const [orders] = await pool.execute<any[]>(
    `SELECT id, status, total, created_at
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 10`,
    [userId]
  );

  return { ...user, orders };
}

export async function updateUserRole(userId: number, input: UpdateUserRoleInput, adminId: number) {
  // Prevent admin from changing their own role
  if (userId === adminId) {
    throw createError(400, "CANNOT_CHANGE_OWN_ROLE", "You cannot change your own role");
  }

  const [rows] = await pool.execute<any[]>("SELECT id FROM users WHERE id = ?", [userId]);
  if ((rows as any[]).length === 0) {
    throw createError(404, "USER_NOT_FOUND", "User not found");
  }

  await pool.execute("UPDATE users SET role = ? WHERE id = ?", [input.role, userId]);

  return { id: userId, role: input.role };
}

// ─── Admin Products ───────────────────────────────────

export async function getAdminProducts(query: AdminProductQuery) {
  const { page, limit, search, category, is_active } = query;
  const { offset, meta } = buildPagination(page, limit);

  const conditions: string[] = [];
  const params: (number | string | boolean)[] = [];

  if (search) {
    conditions.push("(p.name LIKE ? OR p.sku LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    conditions.push("c.slug = ?");
    params.push(category);
  }

  if (is_active !== undefined) {
    conditions.push("p.is_active = ?");
    params.push(is_active);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const [countRows] = await pool.execute<AdminTotalQuery[]>(
    `SELECT COUNT(*) as total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereClause}`,
    params
  );
  const total = countRows[0].total;

  const [rows] = await pool.query<Product[]>(
    `SELECT
       p.*,
       c.name as category_name,
       pi.url as primary_image
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = TRUE
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, pagination: meta(total) };
}

export async function toggleProductActive(productId: number) {
  const [rows] = await pool.execute<any[]>("SELECT id, is_active FROM products WHERE id = ?", [productId]);
  const product = (rows as any[])[0];
  if (!product) throw createError(404, "PRODUCT_NOT_FOUND", "Product not found");

  const newState = !product.is_active;

  await pool.execute("UPDATE products SET is_active = ? WHERE id = ?", [newState, productId]);

  return { id: productId, is_active: newState };
}
