import { db } from "../utils/database";
import { orders } from "../models/order.model";
import { eq, and } from "drizzle-orm";
import { MarketDataService } from "./market-data.service";
import { TradingService } from "./trading.service";

export class OrderService {
  static async createOrder(
    userId: string,
    orderData: {
      symbol: string;
      type: "market" | "limit" | "stop";
      side: "buy" | "sell";
      volume: number;
      price?: number;
      stopLoss?: number;
      takeProfit?: number;
    }
  ) {
    const [order] = await db
      .insert(orders)
      .values({
        userId,
        ...orderData,
        volume: orderData.volume.toString(),
        price: orderData.price?.toString(),
        stopLoss: orderData.stopLoss?.toString(),
        takeProfit: orderData.takeProfit?.toString(),
      })
      .returning();

    // Execute market orders immediately
    if (orderData.type === "market") {
      await this.executeOrder(order.id);
    }

    return order;
  }

  static async executeOrder(orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId));

    if (!order || order.status !== "pending") {
      return null;
    }

    try {
      // Open position based on order
      const position = await TradingService.openPosition(order.userId, {
        symbol: order.symbol,
        side: order.side as "buy" | "sell",
        volume: parseFloat(order.volume),
        stopLoss: order.stopLoss ? parseFloat(order.stopLoss) : undefined,
        takeProfit: order.takeProfit ? parseFloat(order.takeProfit) : undefined,
      });

      // Update order status
      await db
        .update(orders)
        .set({
          status: "executed",
          executedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return position;
    } catch (error) {
      // Mark order as failed
      await db
        .update(orders)
        .set({
          status: "failed",
        })
        .where(eq(orders.id, orderId));

      throw error;
    }
  }

  static async cancelOrder(userId: string, orderId: string) {
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.userId, userId),
          eq(orders.status, "pending")
        )
      );

    if (!order) {
      throw new Error("Order not found or cannot be cancelled");
    }

    await db
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return order;
  }

  static async checkPendingOrders() {
    const pendingOrders = await db
      .select()
      .from(orders)
      .where(and(eq(orders.status, "pending"), eq(orders.type, "limit")));

    for (const order of pendingOrders) {
      const currentPrice = await MarketDataService.getCurrentPrice(
        order.symbol
      );
      const orderPrice = parseFloat(order.price!);

      let shouldExecute = false;

      if (order.side === "buy" && currentPrice <= orderPrice) {
        shouldExecute = true;
      } else if (order.side === "sell" && currentPrice >= orderPrice) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        await this.executeOrder(order.id);
      }
    }
  }

  static async getUserOrders(
    userId: string,
    status?: string,
    limit = 50,
    offset = 0
  ) {
    const whereClause = status
      ? and(eq(orders.userId, userId), eq(orders.status, status))
      : eq(orders.userId, userId);

    return await db
      .select()
      .from(orders)
      .where(whereClause)
      .limit(limit)
      .offset(offset);
  }
}
