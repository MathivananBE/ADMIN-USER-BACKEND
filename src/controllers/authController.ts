//user login, get profile

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { AppDataSource } from "../config/data-source";
import { signToken } from "../utils/jwt";
import { User } from "../entities/User";

/**
 * POST /api/auth/login
 * Users can ONLY log in here. There is no register/signup endpoint for users —
 * accounts only ever get created by the admin via /api/admin/register-user.
 */
export const userLogin = async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid input", errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "This account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = signToken({ role: "user", userId: user.id, email: user.email });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("userLogin error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/auth/me
 * Example protected route for a logged-in user.
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: req.auth?.userId },
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        created_at: true,
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
