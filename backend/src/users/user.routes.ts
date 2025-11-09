import { Router } from "express";
import { UserController } from "./user.controller.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import { validateParams } from "../middlewares/validation/validateParams.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  paramIdSchema,
} from "../utils/validation/userSchemas.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = new UserController();

// Only authenticated users (or admin in the future) can access all users
router.get("/", requireAuth, controller.getAll);

// A user can access only their own data (checked in controller)
router.get("/:id", requireAuth, validateParams(paramIdSchema), controller.getById);

// Public endpoint for creating a new user (registration)
router.post("/", validateBody(createUserSchema), controller.create);

// Update user by ID (only self-update allowed)
router.put(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  validateBody(updateUserSchema),
  controller.update,
);

// Delete user by ID (only self-deletion allowed)
router.delete("/:id", requireAuth, validateParams(paramIdSchema), controller.delete);

export default router;
