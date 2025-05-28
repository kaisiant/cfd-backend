import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // 'market' | 'limit' | 'stop'
  side: varchar("side", { length: 10 }).notNull(), // 'buy' | 'sell'
  volume: decimal("volume", { precision: 15, scale: 5 }).notNull(),
  price: decimal("price", { precision: 15, scale: 5 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  executedAt: timestamp("executed_at"),
  cancelledAt: timestamp("cancelled_at"),
});
