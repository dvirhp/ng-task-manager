import { Response } from "express";
import { UserService } from "./user.service.js";
import { asyncHandler } from "../utils/core/asyncHandler.js";
import { AuthenticatedRequest } from "../auth/auth.middleware.js";

// Create one shared instance of UserService
const userService = new UserService();

export class UserController {
  // Get all users (restricted, should be admin in the future)
  getAll = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await userService.getAll(); // בלי פרמטרים
    res.status(200).json(result);
  });

  // Get user by ID (only self-access allowed)
  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };

    // Block if the user tries to access another account
    if (req.user!.userId !== id) throw new Error("Unauthorized: cannot access other users");

    const result = await userService.getById(id);
    res.status(200).json(result);
  });

  // Create a new user (mainly for admin or management use)
  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await userService.create(req.body);
    res.status(201).json(result);
  });

  // Update user (only self-update allowed)
  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.user!.userId !== id) throw new Error("Unauthorized: cannot update other users");

    const result = await userService.update(id, req.body);
    res.status(200).json(result);
  });

  // Delete user (only self-deletion allowed)
  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params as { id: string };

    if (req.user!.userId !== id) throw new Error("Unauthorized: cannot delete other users");

    const result = await userService.delete(id);
    res.status(200).json(result);
  });
}
