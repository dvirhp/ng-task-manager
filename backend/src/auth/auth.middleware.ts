import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/core/AppError.js";
import { ENV } from "../config/env.js";

// Extend Request to include user data after authentication
export interface AuthenticatedRequest extends Request {
  user?: { userId: string; email: string };
}

// Define expected JWT payload shape
interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

export const requireAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    // Return instead of throwing may be cleaner for middleware
    throw new AppError("Missing or invalid Authorization header", 401);
  }

  const token = header.split(" ")[1];
  if (!token) throw new AppError("Missing access token", 401);

  try {
    const decoded = jwt.verify(
      token,
      ENV.JWT_SECRET as string,
    ) as unknown as TokenPayload;

    if (!decoded.userId || !decoded.email) {
      throw new AppError("Invalid token payload", 401);
    }

    // Attach decoded user to request for next handlers
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    // Consider logging the actual error for debugging
    throw new AppError("Invalid or expired token", 401);
  }
};
