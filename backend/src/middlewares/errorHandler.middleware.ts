import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/core/AppError.js";
import { errorResponse } from "../utils/core/ApiResponse.js";

// Global error handling middleware
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== "production";

  // Handle duplicate key error from MongoDB
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json(errorResponse(`Duplicate value for ${field}`, 409));
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json(errorResponse("Mongoose validation failed", 400, { errors: messages }));
  }

  // Handle invalid ObjectId or cast errors
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(errorResponse(`Invalid ${err.path}: ${err.value}`, 400));
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(errorResponse(err.message, err.statusCode));
  }

  // Log unhandled errors for debugging
  console.error("Unhandled Error:", err);

  // Detailed error in development, generic in production
  if (isDev) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: err.message || "Internal server error",
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(500).json(errorResponse("Something went wrong. Please try again later.", 500));
};
