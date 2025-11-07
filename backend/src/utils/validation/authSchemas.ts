import Joi from "joi";
import { emailSchema, passwordSchema, stringMin2 } from "./commonSchemas.js";

// Validation schema for user registration
export const registerSchema = Joi.object({
  name: stringMin2.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

// Validation schema for user login
export const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: passwordSchema.required(),
});
