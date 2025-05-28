import { Elysia, t } from "elysia";
import { MarketDataService } from "../services/market-data.service";
import { PricingService } from "../services/pricing.service";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware";

export const marketDataController = new Elysia({ prefix: "/market" })
  .use(rateLimitMiddleware(1000, 60000)) // Higher rate limit for market data
  .get("/symbols", async () => {
    const symbols = [
      {
        symbol: "EURUSD",
        description: "Euro vs US Dollar",
        type: "forex",
        minVolume: 0.01,
        maxVolume: 100,
        leverage: 500,
      },
      {
        symbol: "GBPUSD",
        description: "British Pound vs US Dollar",
        type: "forex",
        minVolume: 0.01,
        maxVolume: 100,
        leverage: 500,
      },
      {
        symbol: "USDJPY",
        description: "US Dollar vs Japanese Yen",
        type: "forex",
        minVolume: 0.01,
        maxVolume: 100,
        leverage: 500,
      },
      {
        symbol: "XAUUSD",
        description: "Gold vs US Dollar",
        type: "metals",
        minVolume: 0.01,
        maxVolume: 50,
        leverage: 200,
      },
      {
        symbol: "BTCUSD",
        description: "Bitcoin vs US Dollar",
        type: "crypto",
        minVolume: 0.001,
        maxVolume: 10,
        leverage: 100,
      },
    ];

    return {
      success: true,
      data: symbols,
      timestamp: new Date(),
    };
  })
  .get("/prices/:symbol", async ({ params }) => {
    try {
      const prices = await PricingService.getBidAskPrices(params.symbol);

      return {
        success: true,
        data: {
          symbol: params.symbol,
          ...prices,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  })
  .get(
    "/prices",
    async ({ query }) => {
      try {
        const symbols = query.symbols?.split(",") || ["EURUSD"];
        const prices = await Promise.all(
          symbols.map(async (symbol) => {
            const prices = await PricingService.getBidAskPrices(symbol);
            return {
              symbol,
              ...prices,
              timestamp: new Date(),
            };
          })
        );

        return {
          success: true,
          data: prices,
          timestamp: new Date(),
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          timestamp: new Date(),
        };
      }
    },
    {
      query: t.Object({
        symbols: t.Optional(t.String()),
      }),
    }
  );
