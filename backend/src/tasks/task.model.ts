import mongoose, { Schema, Document } from "mongoose";

// Task interface for TypeScript typing
export interface ITask extends Document {
  title: string;
  description?: string;
  done: boolean;
  list: mongoose.Types.ObjectId;
}

// Define Task schema
const taskSchema = new Schema<ITask>({
  title: { type: String, required: true, trim: true, minlength: 2 },
  description: { type: String, trim: true, default: "" },
  done: { type: Boolean, default: false },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TodoList",
    required: true,
    index: true,
  },
});

// Export Task model
export default mongoose.model<ITask>("Task", taskSchema);
