import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, JwtPayload } from "../types";

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: { status: 401, code: "UNAUTHORIZED", message: "No token provided" }
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      error: { status: 401, code: "INVALID_TOKEN", message: "Token invalid or expired" }
    });
  }
};
