//sign/verify JWT tokens


import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as SignOptions["expiresIn"];

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables");
}



/*
const token = jwt.sign(
  { id: user.id, email: user.email },
  JWT_SECRET,
  { expiresIn: "1h" }
);

const decoded = jwt.verify(token, JWT_SECRET);
*/