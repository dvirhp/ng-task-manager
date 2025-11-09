import Joi from "joi";
import { stringMin2, objectIdSchema, paramSchemas } from "./commonSchemas.js";

// Validation for creating a new todo list
export const createTodoListSchema = Joi.object({
  title: stringMin2.required(),
  description: Joi.string().allow(""),
  sharedWith: Joi.array().items(objectIdSchema),
});

// Validation for updating an existing todo list
export const updateTodoListSchema = Joi.object({
  title: stringMin2,
  description: Joi.string().allow(""),
  sharedWith: Joi.array().items(objectIdSchema),
}).min(1); // Require at least one field to update

// Reuse shared param schemas
export const paramIdSchema = paramSchemas.id;
export const paramUserIdSchema = paramSchemas.userId;
