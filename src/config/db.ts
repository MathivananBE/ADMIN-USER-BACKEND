import dotenv from "dotenv";
import { AppDataSource } from "./data-source";

dotenv.config();

export const testConnection = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log("✅ PostgreSQL connected");
};
