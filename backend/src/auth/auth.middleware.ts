import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/core/AppError.js";
import { ENV } from "../config/env.js";

// Extend Express Request to include authenticated user data
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Define the expected structure of the JWT payload
interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
}

// Middleware to verify JWT and attach user data to the request
export const requireAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  // Validate Authorization header format
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid Authorization header", 401);
  }

  const token = header.split(" ")[1];
  if (!token) throw new AppError("Missing access token", 401);

  try {
    // Verify and decode the JWT
    const decoded = jwt.verify(token, ENV.JWT_SECRET as string) as TokenPayload;

    // Validate payload structure
    if (!decoded.userId || !decoded.email) {
      throw new AppError("Invalid token payload", 401);
    }

    // Attach user info to the request for downstream middleware
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (err) {
    // Token is invalid or expired
    throw new AppError("Invalid or expired token", 401);
  }
};
