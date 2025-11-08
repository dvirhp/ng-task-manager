import jwt, { SignOptions, Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import User, { IUser } from "../users/user.model.js";
import { AppError } from "../utils/core/AppError.js";
import { successResponse } from "../utils/core/ApiResponse.js";
import { ENV } from "../config/env.js";

export class AuthService {
  async register(data: Partial<IUser>) {
    const { name, email, password } = data;
    const existing = await User.findOne({ email }).lean();
    if (existing)
      throw new AppError("User with this email already exists", 409);

    // Create and save new user
    const user = new User({ name, email, password });
    const saved = await user.save();

    // Generate tokens for new user
    const tokens = await this.rotateRefreshToken(
      saved._id.toString(),
      saved.email,
    );

    return successResponse("User registered successfully", {
      user: saved,
      ...tokens,
    });
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select(
      "+password +refreshTokenHash",
    );
    if (!user) throw new AppError("Invalid email or password", 401);

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("Invalid email or password", 401);

    // Create new tokens and return safe user object
    const tokens = await this.rotateRefreshToken(
      user._id.toString(),
      user.email,
    );
    const safeUser = await User.findById(user._id).lean();
    return successResponse("Login successful", { user: safeUser, ...tokens });
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        ENV.JWT_REFRESH_SECRET as Secret,
      ) as any;

      const user = await User.findById(decoded.userId).select(
        "+refreshTokenHash",
      );
      if (!user) throw new AppError("User not found", 404);

      // Compare stored refresh token hash
      const match = await bcrypt.compare(
        refreshToken,
        user.refreshTokenHash || "",
      );
      if (!match) throw new AppError("Invalid or reused refresh token", 401);

      // Issue new tokens
      const tokens = await this.rotateRefreshToken(
        user._id.toString(),
        user.email,
      );
      return successResponse("Token refreshed successfully", tokens);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  private async rotateRefreshToken(userId: string, email: string) {
    const accessOptions: SignOptions = {
      expiresIn: ENV.JWT_ACCESS_EXPIRES as any,
    };
    const refreshOptions: SignOptions = {
      expiresIn: ENV.JWT_REFRESH_EXPIRES as any,
    };

    // Create new JWT access and refresh tokens
    const accessToken = jwt.sign(
      { userId, email },
      ENV.JWT_SECRET as Secret,
      accessOptions,
    );
    const refreshToken = jwt.sign(
      { userId, email },
      ENV.JWT_REFRESH_SECRET as Secret,
      refreshOptions,
    );

    // Store hashed refresh token for reuse check
    const hashed = await bcrypt.hash(refreshToken, 10);
    await User.findByIdAndUpdate(userId, { refreshTokenHash: hashed });

    return { accessToken, refreshToken };
  }
}
