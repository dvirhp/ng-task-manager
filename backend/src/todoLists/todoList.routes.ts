import { Router } from "express";
import { TodoListController } from "./todoList.controller.js";
import { requireAuth } from "../auth/auth.middleware.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import { validateParams } from "../middlewares/validation/validateParams.middleware.js";
import {
  createTodoListSchema,
  updateTodoListSchema,
  paramIdSchema,
} from "../utils/validation/todoListSchemas.js";

const router = Router();
const controller = new TodoListController();

// TodoList routes
// All routes require authentication
// Share routes are placed before generic "/:id" routes to avoid conflicts

// Get all lists for the authenticated user (owned + shared)
router.get("/", requireAuth, controller.getUserLists);

// Share a list with another user (must appear before generic ID routes)
router.post("/:id/share", requireAuth, validateParams(paramIdSchema), controller.shareList);

// Remove shared access for a user (owner or self)
router.post(
  "/:id/unshare",
  requireAuth,
  validateParams(paramIdSchema),
  controller.removeSharedUser,
);

// Get a specific list by its ID
router.get("/:id", requireAuth, validateParams(paramIdSchema), controller.getById);

// Create a new list
router.post("/", requireAuth, validateBody(createTodoListSchema), controller.create);

// Update an existing list
router.put(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  validateBody(updateTodoListSchema),
  controller.update,
);

// Delete a list by ID
router.delete("/:id", requireAuth, validateParams(paramIdSchema), controller.delete);

export default router;
