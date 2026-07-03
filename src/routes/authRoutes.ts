//wires user URLs to auth controller functions

import { Router } from "express";
import { userLogin, getMe } from "../controllers/authController";
import { authenticate, requireUser } from "../middleware/auth";

const router = Router();

// Public: the ONLY entry point for users. No /register or /signup route exists.
router.post("/login", userLogin);

// Protected: example route for a logged-in user
router.get("/me", authenticate, requireUser, getMe);

export default router;
