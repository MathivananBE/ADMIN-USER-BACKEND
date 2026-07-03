//checks token + role (admin vs user)

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

/**
 * Verifies the Bearer token and attaches the decoded payload to req.auth.
 * Does not care about role — use requireAdmin/requireUser after this.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or invalid Authorization header" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.auth = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.role !== "user") {
    return res.status(403).json({ success: false, message: "User access required" });
  }
  next();
};
