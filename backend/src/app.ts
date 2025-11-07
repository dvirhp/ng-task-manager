import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { ENV } from "./config/env.js";
import userRoutes from "./users/user.routes.js";
import todoListRoutes from "./todoLists/todoList.routes.js";
import taskRoutes from "./tasks/task.routes.js";
import authRoutes from "./auth/auth.routes.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app: Application = express();

// Apply security middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Enable CORS for frontend origin
app.use(
  cors({
    origin: ["http://localhost:4200"],
    credentials: true,
  }),
);

// Rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  message: {
    error: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Parse JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB(ENV.MONGO_URI);

// Register routes
app.use("/api/users", userRoutes);
app.use("/api/lists", todoListRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/auth", authLimiter, authRoutes);

// Global error handler (should be last)
app.use(errorHandler);

export default app;
