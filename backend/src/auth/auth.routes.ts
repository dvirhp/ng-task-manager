import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import { registerSchema, loginSchema } from "../utils/validation/authSchemas.js";

const router = Router();
const controller = new AuthController();

// Apply rate limiting to authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Max 10 requests per window per IP
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Route for user registration
router.post("/register", authLimiter, validateBody(registerSchema), controller.register);

// Route for user login
router.post("/login", authLimiter, validateBody(loginSchema), controller.login);

// Route to refresh access token using refresh cookie
router.post("/refresh", controller.refresh);

// Route to log out user and clear refresh token cookie
router.post("/logout", controller.logout);

export default router;
