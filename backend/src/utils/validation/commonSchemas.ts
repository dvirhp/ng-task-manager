import Joi from "joi";

// Validate MongoDB ObjectId format
export const objectIdSchema = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid ObjectId format",
    "string.empty": "ID is required",
  });

// Generic string with minimum length validation
export const stringMin2 = Joi.string().min(2).messages({
  "string.min": "Must be at least 2 characters",
  "string.empty": "Field is required",
});

// Email validation with custom messages
export const emailSchema = Joi.string().email().messages({
  "string.email": "Invalid email address",
  "string.empty": "Email is required",
});

// Password validation (minimum 6 characters)
export const passwordSchema = Joi.string().min(6).messages({
  "string.min": "Password must be at least 6 characters",
  "string.empty": "Password is required",
});

// Validate HEX color code format
export const colorSchema = Joi.string()
  .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
  .messages({
    "string.pattern.base": "Invalid color format",
  });
