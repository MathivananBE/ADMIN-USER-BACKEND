//creates the "users" table


import { AppDataSource } from "./data-source";

/**
 * Creates the users table using TypeORM entity metadata.
 * There is intentionally NO signup/registration table for admins:
 * the admin identity comes from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
 * Only the admin (via a protected route) can insert rows into "users".
 */

const run = async () => {
  try {
    await AppDataSource.initialize();
    await AppDataSource.synchronize();
    console.log("✅ Migration complete: 'users' table is ready");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exitCode = 1;
  } finally {
    await AppDataSource.destroy();
  }
};

run();
