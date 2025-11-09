import TodoList, { ITodoList } from "./todoList.model.js";
import User from "../users/user.model.js";
import { AppError } from "../utils/core/AppError.js";
import { successResponse } from "../utils/core/ApiResponse.js";

export class TodoListService {
  // Get all todo lists for a user (owned and shared)
  async getByUser(userId: string) {
    const lists = await TodoList.find({
      $or: [{ owner: userId }, { sharedWith: userId }],
    })
      .populate("owner", "name email")
      .populate("sharedWith", "name email")
      .populate("tasks");

    return successResponse("Lists fetched successfully", lists);
  }

  // Get a single list by ID (only if owned or shared with the user)
  async getById(id: string, userId: string) {
    const list = await TodoList.findById(id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email")
      .populate("tasks");

    if (!list) throw new AppError("List not found", 404);

    // Ensure the user has permission (owner or shared)
    const isAuthorized =
      list.owner._id.toString() === userId ||
      list.sharedWith.some((u) => u._id.toString() === userId);

    if (!isAuthorized) throw new AppError("Unauthorized", 403);

    return successResponse("List fetched successfully", list);
  }

  // Create a new list (the current user is the owner)
  async create(data: Partial<ITodoList>, userId: string) {
    const newList = new TodoList({ ...data, owner: userId });
    const saved = await newList.save();

    const populated = await TodoList.findById(saved._id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    return successResponse("List created successfully", populated);
  }

  // Update an existing list (only the owner can make changes)
  async update(id: string, data: Partial<ITodoList>, userId: string) {
    const list = await TodoList.findById(id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    if (!list) throw new AppError("List not found", 404);
    if (list.owner._id.toString() !== userId)
      throw new AppError("Only the owner can update this list", 403);

    Object.assign(list, data);
    const updated = await list.save();

    return successResponse("List updated successfully", updated);
  }

  // Delete a list (only the owner can delete)
  async delete(id: string, userId: string) {
    const list = await TodoList.findById(id);
    if (!list) throw new AppError("List not found", 404);
    if (list.owner.toString() !== userId)
      throw new AppError("Only the owner can delete this list", 403);

    await list.deleteOne();
    return successResponse("List deleted successfully", list);
  }

  // Share a list with another user (owner only)
  async shareList(listId: string, ownerId: string, email: string) {
    const list = await TodoList.findById(listId);
    if (!list) throw new AppError("List not found", 404);
    if (list.owner.toString() !== ownerId)
      throw new AppError("Only the owner can share this list", 403);

    const targetUser = await User.findOne({ email });
    if (!targetUser) throw new AppError("User not found", 404);

    // Prevent duplicate sharing
    if (list.sharedWith.some((id) => id.toString() === targetUser._id.toString()))
      throw new AppError("User already has access to this list", 400);

    list.sharedWith.push(targetUser._id);
    await list.save();

    const updated = await TodoList.findById(list._id)
      .populate("owner", "name email")
      .populate("sharedWith", "name email");

    return successResponse("List shared successfully", updated);
  }

  // Remove a user from a shared list
  // Owner can remove any user, shared users can only remove themselves
  async removeSharedUser(listId: string, requesterId: string, userIdToRemove?: string) {
    const list = await TodoList.findById(listId);
    if (!list) throw new AppError("List not found", 404);

    // Owner removes another user
    if (list.owner.toString() === requesterId) {
      if (!userIdToRemove) throw new AppError("Missing userId to remove", 400);

      list.sharedWith = list.sharedWith.filter((u) => u.toString() !== userIdToRemove);
      await list.save();
      return successResponse("User removed by owner", list);
    }

    // Shared user removes themselves
    if (list.sharedWith.some((u) => u.toString() === requesterId)) {
      list.sharedWith = list.sharedWith.filter((u) => u.toString() !== requesterId);
      await list.save();
      return successResponse("You left the list", list);
    }

    throw new AppError("Unauthorized", 403);
  }
}
