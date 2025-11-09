import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AppError } from "../utils/core/AppError.js"; // For consistent error handling

// Cookie configuration used for refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // Prevents client-side access to the cookie
  secure: process.env.NODE_ENV === "production", // Send only over HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Adjust behavior for cross-site requests
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
} as const;

const authService = new AuthService();

// Helper function to set refresh token cookie
const setRefreshCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, REFRESH_COOKIE_OPTIONS);
};

export class AuthController {
  // Register a new user and issue tokens
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(201).json(result);
  });

  // Log in a user and issue tokens
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(200).json(result);
  });

  // Refresh access token using a valid refresh cookie
  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError("Missing refresh token", 401);

    const result = await authService.refreshToken(token);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(200).json(result);
  });

  // Clear the refresh cookie and log out the user
  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      ...REFRESH_COOKIE_OPTIONS,
      maxAge: 0,
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}
