import mongoose, { Schema, Document } from "mongoose";

// Task interface for TypeScript typing
export interface ITask extends Document {
  title: string;
  description?: string;
  done: boolean;
  dueDate?: Date;
  list: mongoose.Types.ObjectId;
}

// Define Task schema
const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, minlength: 2 },
    description: { type: String, trim: true, default: "" },
    done: { type: Boolean, default: false },
    dueDate: { type: Date },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TodoList",
      required: true,
      index: true, // helps query performance
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt
);

// Export Task model
export default mongoose.model<ITask>("Task", taskSchema);
