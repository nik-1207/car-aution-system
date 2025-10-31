import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "car-auction-secret-key";

export interface AuthRequest extends Request {
  user?: {
    username: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Access token required",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const generateToken = (username: string): string => {
  return jwt.sign(
    { username },
    JWT_SECRET,
    { expiresIn: "24h" }, // Token expires in 24 hours
  );
};
