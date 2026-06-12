import multer from "multer";
import { createError } from "./errorHandler";
import { Request } from "express";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Store in memory — we stream directly to S3, no disk needed
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(400, "INVALID_FILE_TYPE", "Only JPEG, PNG and WebP images are allowed") as any);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE }
});
