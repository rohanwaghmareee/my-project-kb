import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * drizzle-kit prefers this TS config over drizzle.config.json.
 * Locally it reads DATABASE_URL from .env (or falls back to the sandbox database);
 * on Render it reads the DATABASE_URL injected from the linked Postgres instance,
 * so `npx drizzle-kit push` in the build command creates the tables automatically.
 *
 * If you ever use an *external* connection string (Render External URL, Neon, Supabase…)
 * append `?sslmode=require&uselibpqcompat=true` to it so SSL is used.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
