import { MarketDataService } from "./market-data.service";
import { redis } from "../utils/redis";

export interface PricingConfig {
  symbol: string;
  spread: number; // in pips
  commission: number; // per lot
  swapLong: number; // daily swap for long positions
  swapShort: number; // daily swap for short positions
}

export class PricingService {
  private static configs: Map<string, PricingConfig> = new Map([
    [
      "EURUSD",
      {
        symbol: "EURUSD",
        spread: 1.5,
        commission: 7,
        swapLong: -2.5,
        swapShort: 0.5,
      },
    ],
    [
      "GBPUSD",
      {
        symbol: "GBPUSD",
        spread: 2.0,
        commission: 7,
        swapLong: -3.0,
        swapShort: 1.0,
      },
    ],
    [
      "USDJPY",
      {
        symbol: "USDJPY",
        spread: 1.8,
        commission: 7,
        swapLong: 2.0,
        swapShort: -4.0,
      },
    ],
    [
      "XAUUSD",
      {
        symbol: "XAUUSD",
        spread: 35,
        commission: 10,
        swapLong: -8.0,
        swapShort: 3.0,
      },
    ],
    [
      "BTCUSD",
      {
        symbol: "BTCUSD",
        spread: 50,
        commission: 15,
        swapLong: -15.0,
        swapShort: 5.0,
      },
    ],
  ]);

  static async getBidAskPrices(
    symbol: string
  ): Promise<{ bid: number; ask: number }> {
    const marketPrice = await MarketDataService.getCurrentPrice(symbol);
    const config = this.configs.get(symbol);

    if (!config) {
      throw new Error(`Pricing config not found for ${symbol}`);
    }

    const pipValue = this.getPipValue(symbol);
    const spreadInPrice = config.spread * pipValue;

    const bid = marketPrice - spreadInPrice / 2;
    const ask = marketPrice + spreadInPrice / 2;

    return { bid, ask };
  }

  static calculateCommission(symbol: string, volume: number): number {
    const config = this.configs.get(symbol);
    return config ? config.commission * volume : 0;
  }

  static calculateSwap(
    symbol: string,
    side: "buy" | "sell",
    volume: number
  ): number {
    const config = this.configs.get(symbol);
    if (!config) return 0;

    const swapRate = side === "buy" ? config.swapLong : config.swapShort;
    return swapRate * volume;
  }

  private static getPipValue(symbol: string): number {
    // Simplified pip value calculation
    if (symbol.includes("JPY")) return 0.01;
    if (symbol.startsWith("XAU")) return 0.1;
    if (symbol.startsWith("BTC")) return 1.0;
    return 0.0001;
  }
}
