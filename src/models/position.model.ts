import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.model";

export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  symbol: varchar("symbol", { length: 20 }).notNull(),
  side: varchar("side", { length: 10 }).notNull(), // 'buy' | 'sell'
  volume: decimal("volume", { precision: 15, scale: 5 }).notNull(),
  openPrice: decimal("open_price", { precision: 15, scale: 5 }).notNull(),
  currentPrice: decimal("current_price", { precision: 15, scale: 5 }),
  stopLoss: decimal("stop_loss", { precision: 15, scale: 5 }),
  takeProfit: decimal("take_profit", { precision: 15, scale: 5 }),
  swap: decimal("swap", { precision: 15, scale: 2 }).default("0"),
  commission: decimal("commission", { precision: 15, scale: 2 }).default("0"),
  pnl: decimal("pnl", { precision: 15, scale: 2 }).default("0"),
  margin: decimal("margin", { precision: 15, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("open"), // 'open' | 'closed'
  openedAt: timestamp("opened_at").defaultNow(),
  closedAt: timestamp("closed_at"),
});
