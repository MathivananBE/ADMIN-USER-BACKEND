//wires admin URLs to admin controller functions

import { Router } from "express";
import { adminLogin, registerUser, listUsers } from "../controllers/adminController";
import { authenticate, requireAdmin } from "../middleware/auth";

const router = Router();

// Public: admin logs in with credentials from .env
router.post("/login", adminLogin);

// Protected: only an authenticated admin can register a new user
router.post("/register-user", authenticate, requireAdmin, registerUser);

// Protected: only an authenticated admin can view the user list
router.get("/users", authenticate, requireAdmin, listUsers);

export default router;
