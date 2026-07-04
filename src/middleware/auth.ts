//checks token + role (admin vs user)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"



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
    //const decoded = verifyToken(token);

    const JWT_SECRET = process.env.JWT_SECRET as string;  

    jwt.verify(token, JWT_SECRET);

    //req.auth = decoded;


    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  //if (req.auth?.role !== "admin") 
  const {role}=req.body;
  if (role!=="admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  //if (req.auth?.role !== "user") {
   const {role}=req.body;
  if (role!=="user") {
    return res.status(403).json({ success: false, message: "User access required" });
  }
  next();
};

export const decodeJwt = (webToken: any) => {
  const decodedToken = jwt.decode(webToken, { complete: true });
  let employeeData: any = decodedToken?.payload;
  return employeeData;
};