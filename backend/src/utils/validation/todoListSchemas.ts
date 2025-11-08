import Joi from "joi";
import { stringMin2, colorSchema, objectIdSchema } from "./commonSchemas.js";

// Validation for creating a new todo list
export const createTodoListSchema = Joi.object({
  title: stringMin2.required(),
  description: Joi.string().allow(""),
  color: colorSchema,
  owner: objectIdSchema.required().messages({
    "string.empty": "Owner ID is required",
  }),
  sharedWith: Joi.array().items(objectIdSchema),
});

// Validation for updating an existing todo list
export const updateTodoListSchema = Joi.object({
  title: stringMin2,
  description: Joi.string().allow(""),
  color: colorSchema,
  isArchived: Joi.boolean(),
  sharedWith: Joi.array().items(objectIdSchema),
}).min(1); // Require at least one field to update

// Validation for list ID parameter
export const paramIdSchema = Joi.object({
  id: objectIdSchema.required(),
});

// Validation for user ID parameter
export const paramUserIdSchema = Joi.object({
  userId: objectIdSchema.required(),
});
