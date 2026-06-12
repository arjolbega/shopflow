import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.error(`[ERROR] ${req.method} ${req.url} — ${err.message}`);

  const status = err.status || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = status === 500 ? "Something went wrong" : err.message;

  res.status(status).json({
    error: { status, code, message }
  });
};

export const createError = (status: number, code: string, message: string): AppError => {
  const err: AppError = new Error(message);
  err.status = status;
  err.code = code;
  return err;
};
