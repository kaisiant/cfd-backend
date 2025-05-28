import { db } from "../utils/database";
import { users } from "../models/user.model";
import { positions } from "../models/position.model";
import { eq, and } from "drizzle-orm";
import { config } from "../config/env";

export class RiskService {
  static async validatePosition(
    userId: string,
    positionData: {
      symbol: string;
      volume: number;
      price: number;
      margin: number;
      leverage?: number;
    }
  ) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    // Check leverage limits
    const leverage = positionData.leverage || user.leverage;
    if (leverage > config.trading.maxLeverage) {
      throw new Error(`Maximum leverage is ${config.trading.maxLeverage}`);
    }

    // Check position size
    if (positionData.volume > config.trading.maxPositionSize) {
      throw new Error(
        `Maximum position size is ${config.trading.maxPositionSize}`
      );
    }

    // Check margin requirements
    const marginRatio = positionData.margin / parseFloat(user.balance);
    if (marginRatio < config.trading.minMargin) {
      throw new Error("Insufficient margin for this position");
    }

    // Check free margin
    if (parseFloat(user.freeMargin) < positionData.margin) {
      throw new Error("Insufficient free margin");
    }

    return true;
  }

  static async checkMarginCall(userId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const marginLevel = parseFloat(user.equity) / parseFloat(user.margin);

    return marginLevel < 1.0; // 100% margin level
  }

  static async liquidatePositions(userId: string) {
    const openPositions = await db
      .select()
      .from(positions)
      .where(and(eq(positions.userId, userId), eq(positions.status, "open")));

    // Close all positions at current market price
    for (const position of openPositions) {
      // This would integrate with TradingService.closePosition
      console.log(`Liquidating position ${position.id}`);
    }
  }

  static async getMarginLevel(userId: string): Promise<number> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const equity = await AccountService.getAccountBalance(userId);

    if (parseFloat(user.margin) === 0) return 0;
    return (equity.equity / parseFloat(user.margin)) * 100;
  }

  static async getPortfolioExposure(userId: string) {
    const positions = await PositionService.getUserPositions(userId, "open");

    const exposureBySymbol = positions.reduce((acc, pos) => {
      const symbol = pos.symbol;
      const volume = parseFloat(pos.volume);
      const side = pos.side;

      if (!acc[symbol]) {
        acc[symbol] = { long: 0, short: 0, net: 0 };
      }

      if (side === "buy") {
        acc[symbol].long += volume;
      } else {
        acc[symbol].short += volume;
      }

      acc[symbol].net = acc[symbol].long - acc[symbol].short;

      return acc;
    }, {} as Record<string, any>);

    return exposureBySymbol;
  }

  static async getUserLimits(userId: string) {
    // In real implementation, fetch from user risk profile
    return {
      maxLeverage: 500,
      maxPositionSize: 100,
      maxDailyLoss: 10000,
      maxDrawdown: 50,
      marginCallLevel: 100,
      stopOutLevel: 50,
    };
  }
}
