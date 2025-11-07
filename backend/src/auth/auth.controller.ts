import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";

// Consider dependency injection for easier testing and flexibility
const authService = new AuthService();

const setRefreshCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refreshToken", token, {
    httpOnly: true, // helps prevent XSS attacks
    secure: isProd, // only send over HTTPS in production
    sameSite: isProd ? "strict" : "lax", // can be adjusted based on client requirements
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
  // Suggestion: move cookie options to a config file for reusability
};

export class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // TODO: add input validation before calling the service
    const result = await authService.login(email, password);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(200).json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing refresh token",
      });
    }
    const result = await authService.refreshToken(token);
    setRefreshCookie(res, result.data!.refreshToken);
    res.status(200).json(result);
  });

  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("refreshToken", { path: "/" });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });
}
