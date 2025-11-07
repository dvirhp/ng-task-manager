import { Response } from "express";
import { TodoListService } from "./todoList.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

// Create one shared instance of the service
const todoListService = new TodoListService();

export class TodoListController {
  // Get all todo lists for the logged-in user
  getUserLists = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { page, limit } = req.query;

      const result = await todoListService.getByOwner(
        req.user!.userId,
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );

      res.status(200).json(result);
    },
  );

  // Get a single list by ID
  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.getById(id, req.user!.userId);
    res.status(200).json(result);
  });

  // Create a new list
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await todoListService.create(req.body, req.user!.userId);
    res.status(201).json(result);
  });

  // Update an existing list
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.update(id, req.body, req.user!.userId);
    res.status(200).json(result);
  });

  // Delete a list by ID
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.delete(id, req.user!.userId);
    res.status(200).json(result);
  });
}
