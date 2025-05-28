import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
  equity: decimal("equity", { precision: 15, scale: 2 }).default("0"),
  margin: decimal("margin", { precision: 15, scale: 2 }).default("0"),
  freeMargin: decimal("free_margin", { precision: 15, scale: 2 }).default("0"),
  leverage: integer("leverage").default(100),
  isActive: boolean("is_active").default(true),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
