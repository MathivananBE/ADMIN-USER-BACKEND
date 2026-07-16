//user login, get profile

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

import jwt,{ JwtPayload } from "jsonwebtoken";
import { decodeJwt } from "../middleware/auth";

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

    const JWT_SECRET =process.env.JWT_SECRET as string;
    const JWT_EXPIRES_IN =process.env.JWT_EXPIRES_IN as string;
    //const token = signToken({ role: "user", userId: user.id, email: user.email });
    const token = jwt.sign(
      {email,user:user,role:"user"},              //Payload....This is the data you want to store inside the token.
      JWT_SECRET,            //Secret Key
      { expiresIn: "1h" }
    );

    console.log("======================user login successfully=========================");

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
  const token = req.header("Authorization")?.replace("Bearer ", "");
  const decodeToken = decodeJwt(token);

  console.log(decodeToken)
  console.log(decodeToken.role?.id);
  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: decodeToken.user?.id },
      // where: { id:1 }, // for testn api
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

    console.log("User profile retrieved successfully:", user);

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
