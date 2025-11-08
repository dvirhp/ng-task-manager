import { Router } from "express";
import { TaskController } from "./task.controller.js";
import { validateBody } from "../middlewares/validation/validateBody.middleware.js";
import { validateParams } from "../middlewares/validation/validateParams.middleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  paramIdSchema,
  paramListIdSchema,
} from "../utils/validation/taskSchemas.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router = Router();
const controller = new TaskController();

// Get all tasks by list ID
router.get(
  "/list/:listId",
  requireAuth,
  validateParams(paramListIdSchema),
  controller.getByList,
);

// Get a single task by ID
router.get(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  controller.getById,
);

// Create a new task
router.post(
  "/",
  requireAuth,
  validateBody(createTaskSchema),
  controller.create,
);

// Update an existing task
router.put(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  validateBody(updateTaskSchema),
  controller.update,
);

// Delete a task by ID
router.delete(
  "/:id",
  requireAuth,
  validateParams(paramIdSchema),
  controller.delete,
);

export default router;
