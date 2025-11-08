import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import {
  registerSchema,
  loginSchema,
} from "../utils/validation/authSchemas.js";

const router = Router();
const controller = new AuthController();

// Route for user registration
router.post("/register", validateBody(registerSchema), controller.register);

// Route for user login
router.post("/login", validateBody(loginSchema), controller.login);

// Route for getting new access token
router.post("/refresh", controller.refresh);

// Route for logout and clearing cookies
router.post("/logout", controller.logout);

export default router;
