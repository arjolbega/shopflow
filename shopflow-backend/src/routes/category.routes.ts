import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import { authenticate } from "../middlewares/authenticate";
import { isAdmin } from "../middlewares/isAdmin";
import { validate } from "../middlewares/validate";
import { upload } from "../middlewares/upload";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema";

const router = Router();

// ─── Public ───────────────────────────────────────────
router.get("/", categoryController.getCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

// ─── Admin ────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  isAdmin,
  upload.single("image"), // optional category image
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put("/:id", authenticate, isAdmin, upload.single("image"), validate(updateCategorySchema), categoryController.updateCategory);

router.delete("/:id", authenticate, isAdmin, categoryController.deleteCategory);

export default router;
