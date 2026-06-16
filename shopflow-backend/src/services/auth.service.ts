import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { generateSecret, verify as verifyTOTP, generateURI } from "otplib";
import QRCode from "qrcode";
import pool from "../config/db";
import mailer from "../config/mailer";
import { createError } from "../middlewares/errorHandler";
import { generateAccessToken, generateRefreshToken, generateSecureToken, hashToken } from "../utils/tokens";
import { verificationEmailTemplate } from "../utils/email-templates/verification";
import { resetPasswordEmailTemplate } from "../utils/email-templates/reset-password";
import { RegisterInput, LoginInput, ResetPasswordInput } from "../schemas/auth.schema";
import { JwtPayload, RefreshToken, User } from "../types";

// ─── Helper ───────────────────────────────────────────

function setRefreshTokenCookie(res: any, token: string): void {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

async function storeRefreshToken(userId: number, token: string, family: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await pool.execute("INSERT INTO refresh_tokens (user_id, token, family, expires_at) VALUES (?, ?, ?, ?)", [userId, token, family, expiresAt]);
}

// ─── Register ─────────────────────────────────────────

export async function registerUser(input: RegisterInput) {
  const { email, password, first_name, last_name } = input;

  // Check duplicate email
  const [existing] = await pool.execute<any[]>("SELECT id FROM users WHERE email = ?", [email]);
  if ((existing as any[]).length > 0) {
    throw createError(409, "EMAIL_TAKEN", "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [result] = await pool.execute<ResultSetHeader>("INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)", [email, hashedPassword, first_name, last_name]);

  const userId = result.insertId;

  // Generate verification token
  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + Number(process.env.VERIFICATION_TOKEN_EXPIRY || 60) * 60 * 1000);

  await pool.execute("INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [userId, hashedToken, expiresAt]);

  // Send verification email
  const verificationUrl = verifyEmailUrl(rawToken);
  const { subject, html } = verificationEmailTemplate(first_name, verificationUrl);
  console.log("===email===");

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject,
      html
    });
  } catch (error) {
    console.error("Email error:", error);
  }

  return { id: userId, email, first_name, last_name };
}

// ─── Verify Email ─────────────────────────────────────

export async function verifyEmail(rawToken: string) {
  const hashedToken = hashToken(rawToken);

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT vt.*, u.email FROM verification_tokens vt
     JOIN users u ON u.id = vt.user_id
     WHERE vt.token = ? AND vt.used = FALSE AND vt.expires_at > NOW()`,
    [hashedToken]
  );

  const record = rows[0];

  if (!record) {
    throw createError(400, "INVALID_TOKEN", "Verification token is invalid or expired");
  }

  // Mark token as used + verify user in one transaction
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute("UPDATE verification_tokens SET used = TRUE WHERE id = ?", [record.id]);
    await connection.execute("UPDATE users SET is_verified = TRUE WHERE id = ?", [record.user_id]);
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { message: "Email verified successfully" };
}

// ─── Resend Verification ──────────────────────────────

export async function resendVerification(email: string) {
  const [rows] = await pool.execute<any[]>("SELECT * FROM users WHERE email = ?", [email]);
  const user = (rows as User[])[0];

  // Always return success — prevents user enumeration
  if (!user || user.is_verified) return;

  // Invalidate old tokens
  await pool.execute("UPDATE verification_tokens SET used = TRUE WHERE user_id = ?", [user.id]);

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + Number(process.env.VERIFICATION_TOKEN_EXPIRY || 60) * 60 * 1000);

  await pool.execute("INSERT INTO verification_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [user.id, hashedToken, expiresAt]);

  const verificationUrl = verifyEmailUrl(rawToken);
  const { subject, html } = verificationEmailTemplate(user.first_name, verificationUrl);

  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html
  });
}

// ─── Login ────────────────────────────────────────────

export async function loginUser(input: LoginInput, res: any) {
  const { email, password, two_fa_token } = input;

  const [rows] = await pool.execute<any[]>("SELECT * FROM users WHERE email = ?", [email]);
  const user = (rows as User[])[0];

  console.log("user", user);
  console.log("password", password);
  console.log("\n");

  // Same error for wrong email or wrong password — prevents user enumeration
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw createError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  if (!user.is_verified) {
    throw createError(403, "EMAIL_NOT_VERIFIED", "Please verify your email before logging in");
  }

  // ── 2FA Check ─────────────────────────────────────
  if (user.two_fa_enabled) {
    if (!two_fa_token) {
      return { requires2FA: true };
    }

    const result = await verifyTOTP({
      secret: user.two_fa_secret!,
      token: two_fa_token
    });

    if (!result.valid) {
      throw createError(401, "INVALID_2FA_TOKEN", "Invalid 2FA token");
    }
  }

  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  const family = uuidv4();

  await storeRefreshToken(user.id, refreshToken, family);
  setRefreshTokenCookie(res, refreshToken);

  return {
    requires2FA: false,
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      two_fa_enabled: user.two_fa_enabled
    }
  };
}

// ─── Refresh ──────────────────────────────────────────

export async function refreshTokens(token: string | undefined, res: any) {
  if (!token) throw createError(401, "UNAUTHORIZED", "No refresh token");

  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
  } catch {
    throw createError(401, "INVALID_TOKEN", "Refresh token invalid or expired");
  }

  const [rows] = await pool.execute<RefreshToken[]>("SELECT * FROM refresh_tokens WHERE token = ?", [token]);
  const storedToken = rows[0];

  if (!storedToken) {
    throw createError(401, "INVALID_TOKEN", "Token not recognised");
  }

  if (storedToken.revoked) {
    // This token is revoked — but its FAMILY might have other active tokens
    // Revoke ALL tokens in the family
    await pool.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE family = ?", [storedToken.family]);
    throw createError(401, "TOKEN_REUSE", "Token reuse detected — please log in again");
  }

  await pool.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?", [token]);

  const payload: JwtPayload = {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  await storeRefreshToken(decoded.userId, newRefreshToken, storedToken.family);
  setRefreshTokenCookie(res, newRefreshToken);

  return { accessToken: newAccessToken };
}

// ─── Logout ───────────────────────────────────────────

export async function logoutUser(token: string | undefined, res: any) {
  if (token) {
    const [rows] = await pool.execute<RefreshToken[]>("SELECT family FROM refresh_tokens WHERE token = ?", [token]);
    const stored = rows[0];
    if (stored) {
      await pool.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE family = ?", [stored.family]);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  });
}

// ─── Forgot Password ──────────────────────────────────

export async function forgotPassword(email: string) {
  const [rows] = await pool.execute<any[]>("SELECT * FROM users WHERE email = ?", [email]);
  const user = (rows as User[])[0];

  // Always return success — prevents user enumeration
  if (!user) return;

  // Invalidate existing reset tokens
  await pool.execute("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ?", [user.id]);

  const rawToken = generateSecureToken();
  const hashedToken = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + Number(process.env.RESET_TOKEN_EXPIRY || 30) * 60 * 1000);

  await pool.execute("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", [user.id, hashedToken, expiresAt]);

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  const { subject, html } = resetPasswordEmailTemplate(user.first_name, resetUrl);

  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject,
    html
  });
}

// ─── Reset Password ───────────────────────────────────

export async function resetPassword(input: ResetPasswordInput) {
  const { token: rawToken, password } = input;
  const hashedToken = hashToken(rawToken);

  const [rows] = await pool.execute<any[]>(
    `SELECT * FROM password_reset_tokens
     WHERE token = ? AND used = FALSE AND expires_at > NOW()`,
    [hashedToken]
  );
  const record = (rows as any[])[0];

  if (!record) {
    throw createError(400, "INVALID_TOKEN", "Reset token is invalid or expired");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, record.user_id]);
    await connection.execute("UPDATE password_reset_tokens SET used = TRUE WHERE id = ?", [record.id]);
    // Revoke all refresh tokens — force re-login after password reset
    await connection.execute("UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?", [record.user_id]);

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return { message: "Password reset successfully" };
}

// ─── 2FA Setup ────────────────────────────────────────
export async function setup2FA(userId: number, email: string) {
  const secret = generateSecret(); // generates base32 secret

  const uri = generateURI({
    issuer: "ShopFlow",
    label: email,
    secret
  });

  const qrCode = await QRCode.toDataURL(uri);

  // Store secret — not enabled until user verifies
  await pool.execute("UPDATE users SET two_fa_secret = ? WHERE id = ?", [secret, userId]);

  return { secret, qrCode };
}

// ─── 2FA Enable ───────────────────────────────────────
export async function enable2FA(userId: number, token: string) {
  const [rows] = await pool.execute<any[]>("SELECT two_fa_secret FROM users WHERE id = ?", [userId]);
  const user = (rows as any[])[0];

  if (!user?.two_fa_secret) {
    throw createError(400, "NO_2FA_SECRET", "2FA setup not initiated");
  }

  const result = await verifyTOTP({ secret: user.two_fa_secret, token });

  if (!result.valid) {
    throw createError(401, "INVALID_2FA_TOKEN", "Invalid 2FA token — please try again");
  }

  await pool.execute("UPDATE users SET two_fa_enabled = TRUE WHERE id = ?", [userId]);

  return { message: "2FA enabled successfully" };
}

// ─── 2FA Disable ──────────────────────────────────────

export async function disable2FA(userId: number, password: string) {
  const [rows] = await pool.execute<any[]>("SELECT password FROM users WHERE id = ?", [userId]);
  const user = (rows as any[])[0];

  if (!(await bcrypt.compare(password, user.password))) {
    throw createError(401, "INVALID_PASSWORD", "Incorrect password");
  }

  await pool.execute("UPDATE users SET two_fa_enabled = FALSE, two_fa_secret = NULL WHERE id = ?", [userId]);

  return { message: "2FA disabled successfully" };
}

// jwt import was missing — add at top of file
import jwt from "jsonwebtoken";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { verifyEmailUrl } from "../utils/helpers";
