import { db } from "../utils/database";
import { positions } from "../models/position.model";
import { eq, and } from "drizzle-orm";
import { MarketDataService } from "./market-data.service";
import { PricingService } from "./pricing.service";

export class PositionService {
  static async getUserPositions(userId: string, status?: string) {
    const whereClause = status
      ? and(eq(positions.userId, userId), eq(positions.status, status))
      : eq(positions.userId, userId);

    return await db.select().from(positions).where(whereClause);
  }

  static async updatePositionPnL(positionId: string) {
    const [position] = await db
      .select()
      .from(positions)
      .where(eq(positions.id, positionId));

    if (!position || position.status !== "open") {
      return null;
    }

    const currentPrice = await MarketDataService.getCurrentPrice(
      position.symbol
    );
    const pnl = this.calculatePnL(position, currentPrice);

    // Calculate swap if position held overnight
    const holdingDays = Math.floor(
      (Date.now() - new Date(position.openedAt).getTime()) /
        (24 * 60 * 60 * 1000)
    );

    let totalSwap = parseFloat(position.swap);
    if (holdingDays > 0) {
      const dailySwap = PricingService.calculateSwap(
        position.symbol,
        position.side as "buy" | "sell",
        parseFloat(position.volume)
      );
      totalSwap += dailySwap * holdingDays;
    }

    await db
      .update(positions)
      .set({
        currentPrice: currentPrice.toString(),
        pnl: pnl.toString(),
        swap: totalSwap.toString(),
      })
      .where(eq(positions.id, positionId));

    return { ...position, currentPrice, pnl, swap: totalSwap };
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

  static async checkStopLossTakeProfit(positionId: string): Promise<boolean> {
    const [position] = await db
      .select()
      .from(positions)
      .where(eq(positions.id, positionId));

    if (!position || position.status !== "open") {
      return false;
    }

    const currentPrice = await MarketDataService.getCurrentPrice(
      position.symbol
    );
    let shouldClose = false;

    // Check stop loss
    if (position.stopLoss) {
      const stopLoss = parseFloat(position.stopLoss);
      if (position.side === "buy" && currentPrice <= stopLoss) {
        shouldClose = true;
      } else if (position.side === "sell" && currentPrice >= stopLoss) {
        shouldClose = true;
      }
    }

    // Check take profit
    if (position.takeProfit) {
      const takeProfit = parseFloat(position.takeProfit);
      if (position.side === "buy" && currentPrice >= takeProfit) {
        shouldClose = true;
      } else if (position.side === "sell" && currentPrice <= takeProfit) {
        shouldClose = true;
      }
    }

    return shouldClose;
  }
}
