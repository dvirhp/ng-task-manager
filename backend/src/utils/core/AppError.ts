// Custom error class for consistent error handling
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  // Define message, status code, and whether it's an expected (operational) error
  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace for better debugging
    Error.captureStackTrace(this, this.constructor);
  }
}
