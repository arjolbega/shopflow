import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { authenticate } from "../middlewares/authenticate";
import { registerSchema, loginSchema, verifyEmailSchema, resendVerificationSchema, forgotPasswordSchema, resetPasswordSchema, enable2FASchema, disable2FASchema } from "../schemas/auth.schema";

const router = Router();

// ─── Public Routes ────────────────────────────────────
router.post("/register", validate(registerSchema), authController.register);
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post("/resend-verification", validate(resendVerificationSchema), authController.resendVerification);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), authController.resetPassword);

// ─── Protected Routes (require login) ─────────────────
router.post("/2fa/setup", authenticate, authController.setup2FA);
router.post("/2fa/enable", authenticate, validate(enable2FASchema), authController.enable2FA);
router.post("/2fa/disable", authenticate, validate(disable2FASchema), authController.disable2FA);

export default router;
