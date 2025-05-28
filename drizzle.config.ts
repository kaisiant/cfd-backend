import { defineConfig } from "drizzle-kit";
import { config } from "./src/config/env";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models/**",
  out: "./drizzle",
  dbCredentials: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.name,
    // ssl: true, // can be boolean | "require" | "allow" | "prefer" | "verify-full" | options from node:tls
  },
});
