import { redis } from "../utils/redis";
import { PositionService } from "./position.service";
import { OrderService } from "./order.service";
import { TradingService } from "./trading.service";
import { logger } from "../utils/logger";
import { RiskService } from "./risk.service";

export class MarketMonitorService {
  private static isRunning = false;

  static async startMonitoring() {
    if (this.isRunning) return;

    this.isRunning = true;
    logger.info("Market monitoring started");

    // Monitor every 1 second
    setInterval(async () => {
      try {
        await this.checkStopLossTakeProfit();
        await this.checkPendingOrders();
        await this.updatePositionPnL();
      } catch (error) {
        logger.error("Market monitoring error:", error);
      }
    }, 1000);

    // Monitor margin calls every 10 seconds
    setInterval(async () => {
      try {
        await this.checkMarginCalls();
      } catch (error) {
        logger.error("Margin call monitoring error:", error);
      }
    }, 10000);
  }

  private static async checkStopLossTakeProfit() {
    // Get all open positions
    const openPositionIds = await redis.smembers("open_positions");

    for (const positionId of openPositionIds) {
      const shouldClose = await PositionService.checkStopLossTakeProfit(
        positionId
      );
      if (shouldClose) {
        // Extract userId from position data
        const positionData = await redis.get(`position:${positionId}`);
        if (positionData) {
          const position = JSON.parse(positionData);
          await TradingService.closePosition(position.userId, positionId);
          logger.info(`Position ${positionId} closed by SL/TP`);
        }
      }
    }
  }

  private static async checkPendingOrders() {
    await OrderService.checkPendingOrders();
  }

  private static async updatePositionPnL() {
    const openPositionIds = await redis.smembers("open_positions");

    for (const positionId of openPositionIds) {
      await PositionService.updatePositionPnL(positionId);
    }
  }

  private static async checkMarginCalls() {
    // Check margin calls for all active users
    const activeUserIds = await redis.smembers("active_users");

    for (const userId of activeUserIds) {
      const isMarginCall = await RiskService.checkMarginCall(userId);
      if (isMarginCall) {
        logger.warn(`Margin call for user ${userId}`);
        // Send notification, potentially liquidate positions
      }
    }
  }
}
