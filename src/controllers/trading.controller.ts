import { Elysia, t } from "elysia";
import { TradingService } from "../services/trading.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { authMacro } from "../utils/auth-macro";

export const tradingController = new Elysia({ prefix: "/trading" })
  // .use(authMiddleware)
  .use(authMacro)
  .post(
    "/positions/open",
    async ({ body, user, ...ret }) => {
      console.log({ user, ret });
      try {
        const position = await TradingService.openPosition(user.id, body);
        return {
          success: true,
          data: position,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
    {
      isAuth: true,
      body: t.Object({
        symbol: t.String(),
        side: t.Union([t.Literal("buy"), t.Literal("sell")]),
        volume: t.Number(),
        leverage: t.Optional(t.Number()),
        stopLoss: t.Optional(t.Number()),
        takeProfit: t.Optional(t.Number()),
      }),
    }
  )
  .post("/positions/:id/close", async ({ params, user }) => {
    try {
      const result = await TradingService.closePosition(user.id, params.id);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  });
