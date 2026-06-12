import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import * as authService from "../services/auth.service";
import { RegisterInput, LoginInput, VerifyEmailInput, ForgotPasswordInput, ResetPasswordInput, Enable2FAInput, Disable2FAInput } from "../schemas/auth.schema";

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      data: {
        ...user,
        message: "Registration successful. Please check your email to verify your account."
      }
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request<{}, {}, VerifyEmailInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.resendVerification(req.body.email);
    // Always return success — never reveal if email exists
    res.status(200).json({
      data: { message: "If that email exists, a verification link has been sent." }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body, res);

    if (result.requires2FA) {
      // Tell frontend to show 2FA input — no tokens issued yet
      res.status(200).json({ data: { requires2FA: true } });
      return;
    }

    res.status(200).json({
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.refreshTokens(req.cookies?.refreshToken, res);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.logoutUser(req.cookies?.refreshToken, res);
    res.status(200).json({ data: { message: "Logged out successfully" } });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request<{}, {}, ForgotPasswordInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      data: { message: "If that email exists, a password reset link has been sent." }
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request<{}, {}, ResetPasswordInput>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const setup2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.setup2FA(req.user!.userId, req.user!.email);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const enable2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.enable2FA(req.user!.userId, req.body.token);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};

export const disable2FA = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.disable2FA(req.user!.userId, req.body.password);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
};
