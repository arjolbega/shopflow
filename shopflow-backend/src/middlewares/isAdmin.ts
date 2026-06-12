import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";

export const isAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: { status: 401, code: "UNAUTHORIZED", message: "Not authenticated" }
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      error: { status: 403, code: "FORBIDDEN", message: "Admin access required" }
    });
    return;
  }

  next();
};
