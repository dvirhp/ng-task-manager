import { Response } from "express";
import { TaskService } from "./task.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

const taskService = new TaskService();

export class TaskController {
  // Get tasks by list ID
  getByList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { listId } = req.params as { listId: string };
    const result = await taskService.getByList(listId, req.user!.userId);
    res.status(200).json(result);
  });

  // Create a new task
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await taskService.create(req.body, req.user!.userId);
    res.status(201).json(result);
  });

  // Update an existing task
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await taskService.update(id, req.body, req.user!.userId);
    res.status(200).json(result);
  });

  // Delete a task
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await taskService.delete(id, req.user!.userId);
    res.status(200).json(result);
  });
}
