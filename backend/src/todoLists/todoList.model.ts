import mongoose, { Schema, Document } from "mongoose";
import Task from "../tasks/task.model.js";
import { cascadeDeleteList, cascadeDeleteLists } from "../utils/dbCascade.js";

// Interface for the TodoList model
export interface ITodoList extends Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId; // The user who created the list
  sharedWith: mongoose.Types.ObjectId[]; // Users with shared access
  tasks?: mongoose.Types.ObjectId[]; // Virtual relation to tasks
}

// Define the TodoList schema
const todoListSchema = new Schema<ITodoList>(
  {
    title: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
);

// Virtual population for tasks related to this list
todoListSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "list",
});

// Include virtuals when converting documents to JSON or plain objects
todoListSchema.set("toObject", { virtuals: true });
todoListSchema.set("toJSON", { virtuals: true });

// Cascade delete related tasks when a single list is deleted
todoListSchema.pre("findOneAndDelete", async function (next) {
  const list = await this.model.findOne(this.getQuery());
  if (list) await cascadeDeleteList(list._id.toString());
  next();
});

// Cascade delete related tasks when multiple lists are deleted
todoListSchema.pre("deleteMany", async function (next) {
  const lists = await this.model.find(this.getQuery());
  const ids = lists.map((l) => l._id.toString());
  if (ids.length) await cascadeDeleteLists(ids);
  next();
});

// Export the TodoList model
export default mongoose.model<ITodoList>("TodoList", todoListSchema);
