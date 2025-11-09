import jwt, { SignOptions, Secret } from "jsonwebtoken";
import type ms from "ms"; // Type import for ms.StringValue
import bcrypt from "bcrypt";
import User, { IUser } from "../users/user.model.js";
import { AppError } from "../utils/core/AppError.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { ENV } from "../config/env.js";

export class AuthService {
  // Register a new user
  async register(data: Partial<IUser>) {
    const { name, email, password } = data;

    // Check if a user with the given email already exists
    const exists = await User.exists({ email });
    if (exists) throw new AppError("User with this email already exists", 409);

    // Create and save the new user
    const user = await new User({ name, email, password }).save();

    // Generate tokens and return minimal user info
    const tokens = await this.rotateRefreshToken(user._id.toString(), user.email);
    const { _id, name: userName, email: userEmail } = user;

    return successResponse("User registered successfully", {
      user: { _id, name: userName, email: userEmail },
      ...tokens,
    });
  }

  // Log in user and return access and refresh tokens
  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password +refreshTokenHash").lean();
    if (!user) throw new AppError("Invalid email or password", 401);

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError("Invalid email or password", 401);

    // Generate new tokens and return user without sensitive fields
    const tokens = await this.rotateRefreshToken(user._id.toString(), user.email);
    const { password: _, refreshTokenHash: __, ...safeUser } = user;

    return successResponse("Login successful", { user: safeUser, ...tokens });
  }

  // Refresh access token using a valid refresh token
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET as Secret) as any;

      const user = await User.findById(decoded.userId).select("+refreshTokenHash");
      if (!user) throw new AppError("User not found", 404);

      // Compare provided refresh token with stored hash
      const match = await bcrypt.compare(refreshToken, user.refreshTokenHash || "");
      if (!match) throw new AppError("Invalid or reused refresh token", 401);

      // Issue new tokens
      const tokens = await this.rotateRefreshToken(user._id.toString(), user.email);
      return successResponse("Token refreshed successfully", tokens);
    } catch (err) {
      console.error("Refresh token error:", err);
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  // Generate new access and refresh tokens and update hashed refresh token in DB
  private async rotateRefreshToken(userId: string, email: string) {
    const accessExpires = ENV.JWT_ACCESS_EXPIRES;
    const refreshExpires = ENV.JWT_REFRESH_EXPIRES;

    // Build sign options dynamically
    const accessOptions: SignOptions = {};
    if (accessExpires) accessOptions.expiresIn = accessExpires as number | ms.StringValue;

    const refreshOptions: SignOptions = {};
    if (refreshExpires) refreshOptions.expiresIn = refreshExpires as number | ms.StringValue;

    // Create tokens
    const accessToken = jwt.sign({ userId, email }, ENV.JWT_SECRET as Secret, accessOptions);
    const refreshToken = jwt.sign(
      { userId, email },
      ENV.JWT_REFRESH_SECRET as Secret,
      refreshOptions,
    );

    // Hash and store refresh token to prevent reuse
    const hashed = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(userId, { refreshTokenHash: hashed }).catch(console.error);

    return { accessToken, refreshToken };
  }
}
