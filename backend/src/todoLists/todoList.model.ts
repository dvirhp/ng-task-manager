import mongoose, { Schema, Document } from "mongoose";
import Task from "../tasks/task.model.js";
import { cascadeDeleteList, cascadeDeleteLists } from "../utils/dbCascade.js";

// Todo list interface for TypeScript typing
export interface ITodoList extends Document {
  title: string;
  description?: string;
  color?: string;
  isArchived?: boolean;
  owner: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  tasks?: mongoose.Types.ObjectId[];
}

// Define TodoList schema
const todoListSchema = new Schema<ITodoList>(
  {
    title: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, default: "" },
    color: {
      type: String,
      default: "#FFFFFF",
      match: /^#([0-9A-Fa-f]{3}){1,2}$/, // validate hex color
    },
    isArchived: { type: Boolean, default: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // improve query performance
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

// Virtual field to populate related tasks
todoListSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "list",
});

// Enable virtuals in JSON and object outputs
todoListSchema.set("toObject", { virtuals: true });
todoListSchema.set("toJSON", { virtuals: true });

// Cascade delete tasks when a list is deleted
todoListSchema.pre("findOneAndDelete", async function (next) {
  const list = await this.model.findOne(this.getQuery());
  if (list) await cascadeDeleteList(list._id.toString());
  next();
});

// Cascade delete tasks for multiple lists
todoListSchema.pre("deleteMany", async function (next) {
  const lists = await this.model.find(this.getQuery());
  const ids = lists.map((l) => l._id.toString());
  if (ids.length) await cascadeDeleteLists(ids);
  next();
});

// Export TodoList model
export default mongoose.model<ITodoList>("TodoList", todoListSchema);
