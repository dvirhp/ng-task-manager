import mongoose from "mongoose";

export const connectDB = async (uri: string, retries = 5, delay = 3000) => {
  while (retries) {
    try {
      // Try to connect to MongoDB
      await mongoose.connect(uri);
      console.log("Connected to MongoDB");
      return;
    } catch (err) {
      retries -= 1;
      console.error(`MongoDB connection failed. Retries left: ${retries}`);

      // Exit process if no retries left
      if (!retries) {
        console.error("Connection failed permanently:", err);
        process.exit(1);
      }

      // Wait before next retry
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};
