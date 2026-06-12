import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authenticate } from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import { addToCartSchema, updateCartSchema } from "../schemas/cart.schema";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/", validate(addToCartSchema), cartController.addToCart);
router.patch("/:productId", validate(updateCartSchema), cartController.updateCartItem);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
