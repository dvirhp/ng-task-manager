import { Router } from "express";
import { TodoListController } from "./todoList.controller.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import { validateParams } from "../middlewares/validation/validateParams.middleware.js";
import {
  createTodoListSchema,
  updateTodoListSchema,
  paramIdSchema,
} from "../utils/validation/todoListSchemas.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = new TodoListController();

// All routes require authentication (JWT)
router.get("/", requireAuth, controller.getUserLists);

// Get a specific list by ID
router.get(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  controller.getById,
);

// Create a new list
router.post(
  "/",
  requireAuth,
  validateBody(createTodoListSchema),
  controller.create,
);

// Update a list by ID
router.put(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  validateBody(updateTodoListSchema),
  controller.update,
);

// Delete a list by ID
router.delete(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  controller.delete,
);

export default router;
