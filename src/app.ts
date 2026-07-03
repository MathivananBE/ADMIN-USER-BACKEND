//Express app, mounts routes, error handling

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
