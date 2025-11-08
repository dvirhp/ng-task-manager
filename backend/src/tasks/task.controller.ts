import { Request, Response } from "express";
import { TaskService } from "./task.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

// Create a single TaskService instance
const taskService = new TaskService();

export class TaskController {
  // Get all tasks for a specific list
  getByList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { listId } = req.params as { listId: string };
    const { page, limit } = req.query;

    // Call service with pagination support
    const result = await taskService.getByList(
      listId,
      req.user!.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );

    res.status(200).json(result);
  });

  // Get task by ID
  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await taskService.getById(id, req.user!.userId);
    res.status(200).json(result);
  });

  // Create new task
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await taskService.create(req.body, req.user!.userId);
    res.status(201).json(result);
  });

  // Update task by ID
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await taskService.update(id, req.body, req.user!.userId);
    res.status(200).json(result);
  });

  // Delete task by ID
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await taskService.delete(id, req.user!.userId);
    res.status(200).json(result);
  });
}
