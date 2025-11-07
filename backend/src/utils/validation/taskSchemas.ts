import Joi from "joi";
import { stringMin2, objectIdSchema } from "./commonSchemas.js";

// Validation for creating a new task
export const createTaskSchema = Joi.object({
  title: stringMin2.required(),
  description: Joi.string().allow(""),
  done: Joi.boolean(),
  dueDate: Joi.date().greater("now").messages({
    "date.greater": "Due date must be in the future",
  }),
  list: objectIdSchema.required(),
});

// Validation for updating an existing task
export const updateTaskSchema = Joi.object({
  title: stringMin2,
  description: Joi.string().allow(""),
  done: Joi.boolean(),
  dueDate: Joi.date(),
}).min(1); // Require at least one field to update

// Validation for task ID parameter
export const paramIdSchema = Joi.object({
  id: objectIdSchema.required(),
});

// Validation for list ID parameter
export const paramListIdSchema = Joi.object({
  listId: objectIdSchema.required(),
});
