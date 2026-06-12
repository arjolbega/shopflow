import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type ValidationTarget = "body" | "query";

export const validate = (schema: ZodType, target: ValidationTarget = "body") => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const data = target === "body" ? req.body : req.query;
    console.log("data", data);
    console.log("\n");

    const result = schema.safeParse(data);

    console.log("result:", result);
    console.log("\n");

    if (!result.success) {
      const errors = result.error.issues.reduce(
        (acc, issue) => {
          const field = issue.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(issue.message);
          return acc;
        },
        {} as Record<string, string[]>
      );

      res.status(400).json({
        error: {
          status: 400,
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: errors
        }
      });
      return;
    }

    if (target === "body") {
      req.body = result.data;
    } else {
      (req as any).validatedQuery = result.data;
    }

    next();
  };
};
