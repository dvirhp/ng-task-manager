import mongoose, { Schema, Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import TodoList from "../todoLists/todoList.model.js";
import { cascadeDeleteUser, cascadeDeleteUsers } from "../utils/dbCascade.js";

// User interface for TypeScript typing
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  refreshTokenHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define User schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
    password: { type: String, required: true, select: false },
    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

// Cascade delete data related to this user
userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getQuery());
  if (user) {
    await cascadeDeleteUser(user._id.toString());
  }
  next();
});

// Cascade delete for multiple users
userSchema.pre("deleteMany", async function (next) {
  const users = await this.model.find(this.getQuery());
  const ids = users.map((u) => u._id.toString());
  if (ids.length) await cascadeDeleteUsers(ids);
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Export User model
export default mongoose.model<IUser>("User", userSchema);
