import { Request, Response, NextFunction } from "express";

// Wrapper to handle async route errors without try/catch in each controller
export const asyncHandler =
  <T extends (req: Request, res: Response, next: NextFunction) => Promise<any>>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    // Ensure any rejected Promise is passed to Express error middleware
    Promise.resolve(fn(req, res, next)).catch(next);
  };
