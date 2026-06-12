import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { authenticate } from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/isAdmin";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/upload";
import { createProductSchema, updateProductSchema, productQuerySchema } from "../schemas/product.schema";

const router = Router();

// ─── Public Routes ────────────────────────────────────
router.get("/", validate(productQuerySchema, "query"), productController.getProducts);
router.get("/:slug", productController.getProductBySlug);

// ─── Admin Routes ─────────────────────────────────────
router.post("/", authenticate, isAdmin, validate(createProductSchema), productController.createProduct);

router.put("/:id", authenticate, isAdmin, validate(updateProductSchema), productController.updateProduct);

router.delete("/:id", authenticate, isAdmin, productController.deleteProduct);

// Images
router.post(
  "/:id/images",
  authenticate,
  isAdmin,
  upload.array("images", 10), // max 10 images at once
  productController.uploadProductImages
);

router.delete("/:id/images/:imageId", authenticate, isAdmin, productController.deleteProductImage);

export default router;
