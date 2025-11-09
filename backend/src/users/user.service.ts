import bcrypt from "bcrypt";
import User, { IUser } from "./user.model.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { AppError } from "../utils/core/AppError.js";

export class UserService {
  // Get all users (no pagination)
  async getAll() {
    const users = await User.find().lean();
    return successResponse("Users fetched successfully", users);
  }

  // Get user by ID
  async getById(id: string) {
    const user = await User.findById(id).lean();
    if (!user) throw new AppError("User not found", 404);
    return successResponse("User fetched successfully", user);
  }

  // Create a new user
  async create(data: Partial<IUser>) {
    const existing = await User.findOne({ email: data.email }).lean();
    if (existing) throw new AppError("User with this email already exists", 409);

    const user = new User(data);
    const saved = await user.save();
    return successResponse("User created successfully", saved);
  }

  // Update user details
  async update(id: string, data: Partial<IUser>) {
    // Re-hash password if changed
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updated = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updated) throw new AppError("User not found", 404);
    return successResponse("User updated successfully", updated);
  }

  // Delete user by ID
  async delete(id: string) {
    const deleted = await User.findOneAndDelete({ _id: id }).lean();
    if (!deleted) throw new AppError("User not found", 404);
    return successResponse("User deleted successfully", deleted);
  }

  // Validate password for login
  async validatePassword(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    // Return safe user object without password
    const safe = await User.findById(user._id).lean();
    return safe;
  }
}
