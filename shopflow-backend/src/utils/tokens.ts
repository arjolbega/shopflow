import jwt from "jsonwebtoken";
import crypto from "crypto"; // built-in Node.js — no install needed
import { JwtPayload } from "../types";

// ─── JWT ──────────────────────────────────────────────

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, process.env.ACCESS_TOKEN_SECRET as string, { expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "15m") as jwt.SignOptions["expiresIn"] });
}

export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign({ userId: payload.userId, email: payload.email, role: payload.role }, process.env.REFRESH_TOKEN_SECRET as string, { expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as jwt.SignOptions["expiresIn"] });
}

// ─── Secure Random Tokens ─────────────────────────────
// Used for email verification and password reset
// crypto.randomBytes is cryptographically secure — never use Math.random() for security tokens

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex"); // 64 char hex string
}

export function hashToken(token: string): string {
  // Hash before storing in DB — if DB is compromised, raw tokens aren't exposed
  // Same principle as hashing passwords
  return crypto.createHash("sha256").update(token).digest("hex");
}
