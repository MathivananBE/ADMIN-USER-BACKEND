//Express app, mounts routes, error handling

import express, {Application} from "express";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";

const cors = require("cors");

const app: Application = express();

app.use(cors());  // Allow requests from other origins

app.use(cors({
  origin: "http://192.168.0.9:3000"   // Replace with your frontend PC's IP and port
}));

app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);


app.get("/api/test", (req, res) => {

    console.log("Test run SuccessFully");
    res.status(200).json({
        success: true,
        message: "Backend is working!"
    });
});

export default app;

