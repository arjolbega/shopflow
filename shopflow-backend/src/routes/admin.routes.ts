import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authenticate } from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/isAdmin";
import { validate } from "../middlewares/validate";
import { adminOrderQuerySchema, adminUserQuerySchema, adminProductQuerySchema, updateOrderStatusSchema, updateUserRoleSchema } from "../schemas/admin.schema";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

// ─── Analytics ────────────────────────────────────────
router.get("/analytics", adminController.getAnalytics);

// ─── Orders ───────────────────────────────────────────
router.get("/orders", validate(adminOrderQuerySchema, "query"), adminController.getAdminOrders);
router.get("/orders/:id", adminController.getAdminOrderById);
router.patch("/orders/:id/status", validate(updateOrderStatusSchema), adminController.updateOrderStatus);

// ─── Users ────────────────────────────────────────────
router.get("/users", validate(adminUserQuerySchema, "query"), adminController.getAdminUsers);
router.get("/users/:id", adminController.getAdminUserById);
router.patch("/users/:id/role", validate(updateUserRoleSchema), adminController.updateUserRole);

// ─── Products ─────────────────────────────────────────
router.get("/products", validate(adminProductQuerySchema, "query"), adminController.getAdminProducts);
router.patch("/products/:id/toggle", adminController.toggleProductActive);

export default router;
