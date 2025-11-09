import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/core/AppError.js";

// Middleware to validate route parameters using a given schema
export const validateParams = (schema: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, { abortEarly: false });

    // Throw an error if validation fails
    if (error) {
      const messages = error.details.map((d: any) => d.message);
      throw new AppError(`Parameter validation failed: ${messages.join(", ")}`, 400);
    }

    // Continue if parameters are valid
    next();
  };
};
