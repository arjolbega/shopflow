import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: {
      status: 404,
      code: "ROUTE_NOT_FOUND",
      message: `Cannot ${req.method} ${req.url}`
    }
  });
};
