import dotenv from "dotenv";    
import { AppDataSource } from "./data-source";

dotenv.config();  //dotenv is a package that loads values from a .env file into your application.

export const testConnection = async (): Promise<void> => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  console.log("✅ PostgreSQL connected");
};
