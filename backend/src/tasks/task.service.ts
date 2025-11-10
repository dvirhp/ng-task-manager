import Task, { ITask } from "./task.model.js";
import TodoList from "../todoLists/todoList.model.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { AppError } from "../utils/core/AppError.js";

export class TaskService {
  // Helper: validate that a user has access to a given list
  private async validateListAccess(listId: string, userId: string): Promise<void> {
    const list = await TodoList.findById(listId).select("owner sharedWith");
    if (!list) throw new AppError("List not found", 404);

    // Check if user is either owner or shared participant
    const isAuthorized =
      list.owner.toString() === userId || list.sharedWith.some((u) => u.toString() === userId);

    if (!isAuthorized) throw new AppError("Unauthorized", 403);
  }

  // Get all tasks for a list (no pagination)
  async getByList(listId: string, userId: string) {
    await this.validateListAccess(listId, userId);

    const tasks = await Task.find({ list: listId }).lean();

    return successResponse("Tasks fetched successfully", tasks);
  }

  // Create a new task
  async create(data: Partial<ITask>, userId: string) {
    if (!data.list) throw new AppError("Missing list reference", 400);

    await this.validateListAccess(data.list.toString(), userId);

    const task = new Task(data);
    const saved = await task.save();
    return successResponse("Task created successfully", saved);
  }

  /* Helper function: Fetches a task by ID and verifies the current user’s authorization
  used in both update and delete to avoid duplicated access-check code. */
  private async getAuthorizedTask(id: string, userId: string) {
    const task = await Task.findById(id).populate({
      path: "list",
      select: "owner sharedWith title",
    });

    if (!task) throw new AppError("Task not found", 404);

    const list = task.list as any;
    const isAuthorized =
      list.owner.toString() === userId || list.sharedWith.some((u: any) => u.toString() === userId);

    if (!isAuthorized) throw new AppError("Unauthorized", 403);

    return task;
  }

  // Update an existing task
  async update(id: string, data: Partial<ITask>, userId: string) {
    const task = await this.getAuthorizedTask(id, userId);

    if (data.list && data.list.toString() !== (task.list as any)._id.toString())
      throw new AppError("Changing task list is not allowed", 400);

    Object.assign(task, data);
    const updated = await task.save();
    return successResponse("Task updated successfully", updated);
  }

  // Delete a task
  async delete(id: string, userId: string) {
    const task = await this.getAuthorizedTask(id, userId);
    await task.deleteOne();
    return successResponse("Task deleted successfully", task);
  }
}
