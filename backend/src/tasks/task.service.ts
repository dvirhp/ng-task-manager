import Task, { ITask } from "./task.model.js";
import TodoList from "../todoLists/todoList.model.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { AppError } from "../utils/core/AppError.js";
import { paginateQuery } from "../utils/core/pagination.js";

export class TaskService {
  // Get all tasks for a list (with pagination)
  async getByList(listId: string, userId: string, page = 1, limit = 20) {
    const list = await TodoList.findById(listId).select("owner");
    if (!list) throw new AppError("List not found", 404);
    if (list.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    const result = await paginateQuery(Task, { list: listId }, "list", {
      page,
      limit,
      maxLimit: 100,
    });

    return successResponse("Tasks fetched successfully", result);
  }

  // Get a task by ID
  async getById(id: string, userId: string) {
    const task = await Task.findById(id).populate({
      path: "list",
      select: "title owner",
    });

    if (!task) throw new AppError("Task not found", 404);
    if ((task.list as any)?.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    return successResponse("Task fetched successfully", task);
  }

  // Create a new task
  async create(data: Partial<ITask>, userId: string) {
    if (!data.list) throw new AppError("Missing list reference", 400);

    const list = await TodoList.findById(data.list).select("owner");
    if (!list) throw new AppError("List not found", 404);
    if (list.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    const task = new Task(data);
    const saved = await task.save();
    return successResponse("Task created successfully", saved);
  }

  // Update an existing task
  async update(id: string, data: Partial<ITask>, userId: string) {
    const task = await Task.findById(id).populate({
      path: "list",
      select: "owner title",
    });

    if (!task) throw new AppError("Task not found", 404);
    if ((task.list as any)?.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    // Prevent changing list reference
    if (data.list && data.list.toString() !== (task.list as any)._id.toString())
      throw new AppError("Changing task list is not allowed", 400);

    // Merge updates and save
    Object.assign(task, data);
    const updated = await task.save();

    return successResponse("Task updated successfully", updated);
  }

  // Delete a task
  async delete(id: string, userId: string) {
    const task = await Task.findById(id).populate({
      path: "list",
      select: "owner",
    });

    if (!task) throw new AppError("Task not found", 404);
    if ((task.list as any)?.owner.toString() !== userId)
      throw new AppError("Unauthorized", 403);

    await task.deleteOne();
    return successResponse("Task deleted successfully", task);
  }
}
