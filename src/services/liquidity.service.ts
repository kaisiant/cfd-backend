import { redis } from "../utils/redis";
import { MarketDataService } from "./market-data.service";

export interface LiquidityProvider {
  id: string;
  name: string;
  priority: number;
  maxVolume: number;
  symbols: string[];
}

export class LiquidityService {
  private static providers: LiquidityProvider[] = [
    {
      id: "lp1",
      name: "Prime Liquidity",
      priority: 1,
      maxVolume: 100,
      symbols: ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"],
    },
    {
      id: "lp2",
      name: "Institutional Bridge",
      priority: 2,
      maxVolume: 50,
      symbols: ["XAUUSD", "BTCUSD"],
    },
  ];

  static async hedgePosition(
    symbol: string,
    volume: number,
    side: "buy" | "sell"
  ) {
    // Find suitable liquidity provider
    const provider = this.providers.find(
      (p) => p.symbols.includes(symbol) && p.maxVolume >= volume
    );

    if (!provider) {
      // Store unhedged position for manual handling
      await this.storeUnhedgedPosition(symbol, volume, side);
      return false;
    }

    // Execute hedge trade with provider
    const hedgePrice = await MarketDataService.getCurrentPrice(symbol);
    const hedgeResult = await this.executeHedgeTrade(provider, {
      symbol,
      volume,
      side: side === "buy" ? "sell" : "buy", // Opposite side for hedge
      price: hedgePrice,
    });

    // Log hedge execution
    await redis.setex(
      `hedge:${Date.now()}`,
      3600,
      JSON.stringify({
        provider: provider.id,
        symbol,
        volume,
        side,
        price: hedgePrice,
        timestamp: new Date(),
      })
    );

    return hedgeResult;
  }

  private static async storeUnhedgedPosition(
    symbol: string,
    volume: number,
    side: string
  ) {
    const unhedged = {
      symbol,
      volume,
      side,
      timestamp: new Date(),
    };

    await redis.lpush("unhedged_positions", JSON.stringify(unhedged));
  }

  private static async executeHedgeTrade(
    provider: LiquidityProvider,
    trade: any
  ) {
    // Mock implementation - in real system, this would connect to LP APIs
    console.log(`Executing hedge trade with ${provider.name}:`, trade);
    return true;
  }

  static async getNetExposure(symbol: string): Promise<number> {
    // Calculate net exposure across all client positions
    const exposureKey = `exposure:${symbol}`;
    const netExposure = await redis.get(exposureKey);
    return netExposure ? parseFloat(netExposure) : 0;
  }

  static async updateNetExposure(
    symbol: string,
    volumeChange: number,
    side: "buy" | "sell"
  ) {
    const exposureKey = `exposure:${symbol}`;
    const multiplier = side === "buy" ? 1 : -1;
    const change = volumeChange * multiplier;

    await redis.incrbyfloat(exposureKey, change);
  }
}
