import { Request, Response } from "express";
import { generateToken } from "../middleware/auth";

interface LoginRequest {
  username: string;
  password: string;
}

export class AuthController {
  public static async generateAuthToken(request: Request, response: Response): Promise<void> {
    try {
      const { username, password } = request.body as LoginRequest;

      // Static credentials as specified
      const STATIC_USERNAME = "Admin";
      const STATIC_PASSWORD = "Admin";

      // Validate credentials
      if (!username || !password) {
        response.status(400).json({
          success: false,
          message: "Username and password are required",
        });
        return;
      }

      if (username !== STATIC_USERNAME || password !== STATIC_PASSWORD) {
        response.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
        return;
      }

      // Generate token
      const token = generateToken(username);

      response.status(200).json({
        success: true,
        message: "Token generated successfully",
        data: {
          token,
          tokenType: "Bearer",
          expiresIn: "24h",
        },
      });
    } catch (error) {
      response.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
