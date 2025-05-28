import { redis } from "../utils/redis";

export interface MarketTick {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: number;
}

export class MarketDataService {
  private static priceCache = new Map<string, MarketTick>();

  static async getCurrentPrice(symbol: string): Promise<number> {
    // Try cache first
    const cached = await redis.get(`price:${symbol}`);
    if (cached) {
      const tick: MarketTick = JSON.parse(cached);
      return (tick.bid + tick.ask) / 2;
    }

    // Fallback to mock data for demo
    return this.generateMockPrice(symbol);
  }

  static async updatePrice(symbol: string, bid: number, ask: number) {
    const tick: MarketTick = {
      symbol,
      bid,
      ask,
      timestamp: Date.now(),
    };

    // Cache price
    await redis.setex(`price:${symbol}`, 5, JSON.stringify(tick));

    // Broadcast to subscribers
    await redis.publish(`price:${symbol}`, JSON.stringify(tick));
  }

  private static generateMockPrice(symbol: string): number {
    const basePrices: Record<string, number> = {
      EURUSD: 1.085,
      GBPUSD: 1.265,
      USDJPY: 150.25,
      AUDUSD: 0.658,
      USDCHF: 0.912,
      USDCAD: 1.358,
      XAUUSD: 2025.5,
      BTCUSD: 43250.0,
    };

    const basePrice = basePrices[symbol] || 1.0;
    const volatility = 0.001; // 0.1% volatility
    const change = (Math.random() - 0.5) * volatility * 2;

    return basePrice * (1 + change);
  }
}
