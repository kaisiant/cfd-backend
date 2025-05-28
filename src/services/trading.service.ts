import { db } from "../utils/database";
import { positions } from "../models/position.model";
import { users } from "../models/user.model";
import { eq, and } from "drizzle-orm";
import { MarketDataService } from "./market-data.service";
import { RiskService } from "./risk.service";
import { tradingMetrics } from "../middleware/metric.middleware";

export class TradingService {
  static async openPosition(
    userId: string,
    orderData: {
      symbol: string;
      side: "buy" | "sell";
      volume: number;
      leverage?: number;
      stopLoss?: number;
      takeProfit?: number;
    }
  ) {
    try {
      // Get current market price
      const currentPrice = await MarketDataService.getCurrentPrice(
        orderData.symbol
      );

      // Calculate margin requirement
      const margin =
        (orderData.volume * currentPrice) / (orderData.leverage || 100);

      // Risk checks
      await RiskService.validatePosition(userId, {
        ...orderData,
        price: currentPrice,
        margin,
      });

      // Check user balance
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (parseFloat(user.freeMargin) < margin) {
        throw new Error("Insufficient margin");
      }

      // Open position
      const [position] = await db
        .insert(positions)
        .values({
          userId,
          symbol: orderData.symbol,
          side: orderData.side,
          volume: orderData.volume.toString(),
          openPrice: currentPrice.toString(),
          currentPrice: currentPrice.toString(),
          stopLoss: orderData.stopLoss?.toString(),
          takeProfit: orderData.takeProfit?.toString(),
          margin: margin.toString(),
        })
        .returning();

      // Record metrics
      tradingMetrics.tradesTotal.inc({
        symbol: orderData.symbol,
        side: orderData.side,
        status: "success",
      });

      tradingMetrics.tradeVolume.inc(
        {
          symbol: orderData.symbol,
        },
        orderData.volume
      );

      // Update open positions count
      // const openPositions = await this.getOpenPositionsCount(orderData.symbol);
      // tradingMetrics.positionsOpen.set(
      //   {
      //     symbol: orderData.symbol,
      //   },
      //   openPositions
      // );

      // Update user margin
      await this.updateUserMargin(userId);

      return position;
    } catch (error) {
      // Record failed trades
      tradingMetrics.tradesTotal.inc({
        symbol: orderData.symbol,
        side: orderData.side,
        status: "failed",
      });

      throw error;
    }
  }

  static async closePosition(userId: string, positionId: string) {
    const [position] = await db
      .select()
      .from(positions)
      .where(
        and(
          eq(positions.id, positionId),
          eq(positions.userId, userId),
          eq(positions.status, "open")
        )
      );

    if (!position) {
      throw new Error("Position not found");
    }

    const currentPrice = await MarketDataService.getCurrentPrice(
      position.symbol
    );
    const pnl = this.calculatePnL(position, currentPrice);

    // Update position
    await db
      .update(positions)
      .set({
        status: "closed",
        currentPrice: currentPrice.toString(),
        pnl: pnl.toString(),
        closedAt: new Date(),
      })
      .where(eq(positions.id, positionId));

    // Update user balance
    await this.updateUserBalance(userId, pnl);
    await this.updateUserMargin(userId);

    return { ...position, pnl };
  }

  private static calculatePnL(position: any, currentPrice: number): number {
    const openPrice = parseFloat(position.openPrice);
    const volume = parseFloat(position.volume);

    if (position.side === "buy") {
      return (currentPrice - openPrice) * volume;
    } else {
      return (openPrice - currentPrice) * volume;
    }
  }

  private static async updateUserBalance(userId: string, pnl: number) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const newBalance = parseFloat(user.balance) + pnl;

    await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId));
  }

  private static async updateUserMargin(userId: string) {
    // Calculate total margin from open positions
    const openPositions = await db
      .select()
      .from(positions)
      .where(and(eq(positions.userId, userId), eq(positions.status, "open")));

    const totalMargin = openPositions.reduce(
      (sum, pos) => sum + parseFloat(pos.margin),
      0
    );

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const freeMargin = parseFloat(user.balance) - totalMargin;

    await db
      .update(users)
      .set({
        margin: totalMargin.toString(),
        freeMargin: freeMargin.toString(),
      })
      .where(eq(users.id, userId));
  }

  static async modifyPosition(
    userId: string,
    positionId: string,
    modifications: {
      stopLoss?: number;
      takeProfit?: number;
    }
  ) {
    const [position] = await db
      .select()
      .from(positions)
      .where(
        and(
          eq(positions.id, positionId),
          eq(positions.userId, userId),
          eq(positions.status, "open")
        )
      );

    if (!position) {
      throw new Error("Position not found");
    }

    await db
      .update(positions)
      .set({
        stopLoss: modifications.stopLoss?.toString(),
        takeProfit: modifications.takeProfit?.toString(),
      })
      .where(eq(positions.id, positionId));

    return { ...position, ...modifications };
  }

  static async getTradeHistory(userId: string, limit = 50, offset = 0) {
    return await db
      .select()
      .from(positions)
      .where(eq(positions.userId, userId))
      .limit(limit)
      .offset(offset);
  }
}
