import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "../config/env";

const client = postgres({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
