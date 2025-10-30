import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
        iat: number;
        exp: number;
      };
    }
  }
}

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Static credentials
const STATIC_USERNAME = "Admin";
const STATIC_PASSWORD = "Admin";

export interface AuthRequest extends Request {
  user?: {
    username: string;
    iat: number;
    exp: number;
  };
}

export class AuthService {
  public static generateToken(username: string): string {
    return jwt.sign({ username }, JWT_SECRET, { expiresIn: "24h" });
  }

  public static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  public static validateCredentials(username: string, password: string): boolean {
    return username === STATIC_USERNAME && password === STATIC_PASSWORD;
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      message: "Access token required" 
    });
    return;
  }

  try {
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export const login = (req: Request, res: Response): void => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
      return;
    }

    if (!AuthService.validateCredentials(username, password)) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
      return;
    }

    const token = AuthService.generateToken(username);

    res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        token,
        tokenType: "Bearer",
        expiresIn: "24h",
        username
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};