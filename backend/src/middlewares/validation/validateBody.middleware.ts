import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/core/AppError.js";

// Middleware for validating request body with a given schema
export const validateBody = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    // If validation fails, throw an error with all messages
    if (error) {
      const messages = error.details.map((d: any) => d.message);
      throw new AppError(`Validation error: ${messages.join(", ")}`, 400);
    }

    // Continue to next middleware if valid
    next();
  };
};
