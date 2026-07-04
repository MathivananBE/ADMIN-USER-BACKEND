//Express app, mounts routes, error handling

import express, {Application} from "express";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";

const app: Application = express();

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);


export default app;
