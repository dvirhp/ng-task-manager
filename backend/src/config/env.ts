import dotenv from "dotenv";
dotenv.config();

// Helper to ensure required environment variables exist
const must = (name: string, value: string | undefined) => {
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
};

// Centralized environment configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  MONGO_URI: must("MONGO_URI", process.env.MONGO_URI),
  JWT_SECRET: must("JWT_SECRET", process.env.JWT_SECRET),
  JWT_REFRESH_SECRET: must(
    "JWT_REFRESH_SECRET",
    process.env.JWT_REFRESH_SECRET,
  ),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || "15m",
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || "7d",
};
