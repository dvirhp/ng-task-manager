import Joi from "joi";
import { stringMin2, emailSchema, passwordSchema, paramSchemas } from "./commonSchemas.js";

// Validation for creating a new user
export const createUserSchema = Joi.object({
  name: stringMin2.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

// Validation for updating user data
export const updateUserSchema = Joi.object({
  name: stringMin2,
  email: emailSchema,
  password: passwordSchema,
}).min(1); // Require at least one field for update

// Use shared param schema
export const paramIdSchema = paramSchemas.id;
