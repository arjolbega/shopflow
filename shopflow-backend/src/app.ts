import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import cartRoutes from "./routes/cart.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import productRoutes from "./routes/product.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFound";
import pool from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security ─────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"]
  })
);

// ─── Rate Limiting ────────────────────────────────────
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use(
  "/api/auth/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
  })
);

// ─── Body Parsing ─────────────────────────────────────
// Stripe webhooks need raw body — must come before express.json()
app.use("/api/orders/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(cookieParser());

// ─── Health Check ─────────────────────────────────────
app.get("/health", async (req, res) => {
  try {
    // Test DB connection
    await pool.execute("SELECT 1");
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: "connected"
    });
  } catch {
    res.status(503).json({
      status: "error",
      timestamp: new Date().toISOString(),
      database: "disconnected"
    });
  }
});

// ─── Routes (added as we build each phase) ────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 Handler ──────────────────────────────────────
app.use(notFoundHandler);

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running`);
});

export default app;
