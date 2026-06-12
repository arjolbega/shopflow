import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { createOrderSchema, orderQuerySchema } from "../schemas/order.schema";

const router = Router();

// ─── Stripe Webhook ───────────────────────────────────
// Must be BEFORE authenticate — Stripe calls this, not our frontend
// Raw body is already configured in app.ts for this route
router.post("/webhook", orderController.stripeWebhook);

// ─── Protected Routes ─────────────────────────────────
router.use(authenticate);

router.post("/", validate(createOrderSchema), orderController.createOrder);
router.get("/", validate(orderQuerySchema, "query"), orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.patch("/:id/cancel", orderController.cancelOrder);
router.get("/:id/payment-intent", orderController.getPaymentIntent);

export default router;
