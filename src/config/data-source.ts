import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASS,
  database:process.env.DATABASE,
  // url: process.env.DATABASE_URL,
  synchronize: true,
  logging: true,
  entities: [User],
  migrations: [],
});





