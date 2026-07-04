//admin login, register user, list users

import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

import jwt from "jsonwebtoken";
const userRepository = AppDataSource.getRepository(User);



const SALT_ROUNDS = 10;

/**
 * POST /api/admin/login
 * The admin is a single fixed identity from env vars — there is no admin table
 * and no admin signup. This just checks the submitted credentials against env.
 */
export const adminLogin = async (req: Request, res: Response) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  /*
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid input", errors: parsed.error.flatten() });
  }
    */

  const { email, password } = req.body;

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
  }

  //const token = signToken({ role: "admin", email });

  const JWT_SECRET = process.env.JWT_SECRET as string;  

  const token = jwt.sign(
  {email,role:"adimin"},              //Payload....This is the data you want to store inside the token.
  JWT_SECRET,            //Secret Key
  { expiresIn: "1h" }
);

  return res.status(200).json({
    success: true,
    message: "Admin login successful",
    role:"admin",
    token
  });
};

/**
 * POST /api/admin/register-user
 * Protected route: only a valid admin token can hit this.
 * This is the ONLY way a user account gets created — there is no public signup.
 */
export const registerUser = async (req: Request, res: Response) => {
  const schema = z.object({
    name: z.string().min(2).max(150),
    email: z.string().email(),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Invalid input", errors: parsed.error.flatten() });
  }
 

  const { name, email, password } = parsed.data;

  try {
    const userRepo = AppDataSource.getRepository(User);
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = userRepo.create({ name, email, password_hash: passwordHash });
    const savedUser = await userRepo.save(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        is_active: savedUser.is_active,
        created_at: savedUser.created_at,
      },
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * GET /api/admin/users
 * Optional helper so the admin page can list all registered users.
 */
export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await AppDataSource.getRepository(User).find({
      select: {
        id: true,
        name: true,
        email: true,
        is_active: true,
        created_at: true,
      },
      order: { created_at: "DESC" },
    });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error("listUsers error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
