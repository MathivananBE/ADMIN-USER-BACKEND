//starts everything (loads .env, connects DB, listens)

import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { testConnection } from "./config/db";

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
