import TodoList, { ITodoList } from "./todoList.model.js";
import { AppError } from "../utils/core/AppError.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { paginateQuery } from "../utils/core/pagination.js";

export class TodoListService {
  // Get all lists for a user with pagination
  async getByOwner(userId: string, page = 1, limit = 10) {
    const result = await paginateQuery(
      TodoList,
      { owner: userId },
      ["owner", "tasks"],
      { page, limit, maxLimit: 100 },
    );

    return successResponse("Lists fetched successfully", result);
  }

  // Get list by ID
  async getById(id: string, userId: string) {
    const list = await TodoList.findById(id)
      .populate("owner", "name email")
      .populate("tasks");

    if (!list) throw new AppError("List not found", 404);
    if (list.owner._id.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    return successResponse("List fetched successfully", list);
  }

  // Create a new list
  async create(data: Partial<ITodoList>, userId: string) {
    // Ensure the owner is the logged-in user
    if (data.owner && data.owner.toString() !== userId)
      throw new AppError("Invalid owner assignment", 403);

    const todoList = new TodoList({ ...data, owner: userId });
    const saved = await todoList.save();
    return successResponse("List created successfully", saved);
  }

  // Update an existing list
  async update(id: string, data: Partial<ITodoList>, userId: string) {
    const list = await TodoList.findById(id)
      .populate("owner", "name email")
      .populate("tasks");

    if (!list) throw new AppError("List not found", 404);
    if (list.owner._id.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    // Prevent changing ownership
    if (data.owner && data.owner.toString() !== list.owner._id.toString())
      throw new AppError("Changing list owner is not allowed", 400);

    Object.assign(list, data);
    const updated = await list.save();

    return successResponse("List updated successfully", updated);
  }

  // Delete a list
  async delete(id: string, userId: string) {
    const list = await TodoList.findById(id);
    if (!list) throw new AppError("List not found", 404);
    if (list.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    await list.deleteOne();
    return successResponse("List deleted successfully", list);
  }
}
