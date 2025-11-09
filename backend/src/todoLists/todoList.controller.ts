import { Response } from "express";
import { TodoListService } from "./todoList.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

// Shared instance of the todo list service
const todoListService = new TodoListService();

export class TodoListController {
  // Get all todo lists (owned and shared)
  getUserLists = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await todoListService.getByUser(req.user!.userId);
    res.status(200).json(result);
  });

  // Get a single list by ID (accessible by owner or shared user)
  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.getById(id, req.user!.userId);
    res.status(200).json(result);
  });

  // Create a new todo list (owner is the current user)
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await todoListService.create(req.body, req.user!.userId);
    res.status(201).json(result);
  });

  // Update an existing todo list (only the owner can modify)
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.update(id, req.body, req.user!.userId);
    res.status(200).json(result);
  });

  // Delete a todo list (only the owner can delete)
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await todoListService.delete(id, req.user!.userId);
    res.status(200).json(result);
  });

  // Share a todo list with another user by email (owner only)
  shareList = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { email } = req.body as { email: string };
    const result = await todoListService.shareList(id, req.user!.userId, email);
    res.status(200).json(result);
  });

  // Remove a user from a shared list (owner or self)
  removeSharedUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { userId } = req.body as { userId?: string };
    const result = await todoListService.removeSharedUser(id, req.user!.userId, userId);
    res.status(200).json(result);
  });
}
