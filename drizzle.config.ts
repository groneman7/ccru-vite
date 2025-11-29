import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.PG_DATABASE_URL) {
  throw new Error("PG_DATABASE_URL is not set in the .env file");
}

export default defineConfig({
  dbCredentials: {
    url: process.env.PG_DATABASE_URL,
  },
  dialect: "postgresql",
  schemaFilter: ["_migrations", "authz", "better-auth", "public"],
  migrations: {
    table: "_migrations",
    schema: "_drizzle",
  },
  out: "./drizzle/migrations", // Your migrations folder
  schema: "./src/db/schema.ts",
});
