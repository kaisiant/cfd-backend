import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { PositionService } from "../services/position.service";
import { TradingService } from "../services/trading.service";

export const positionsController = new Elysia({ prefix: "/positions" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ user, query }) => {
      try {
        const positions = await PositionService.getUserPositions(
          user.id,
          query.status as string
        );

        return {
          success: true,
          data: positions,
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
        status: t.Optional(t.Union([t.Literal("open"), t.Literal("closed")])),
      }),
    }
  )
  .get("/:id", async ({ user, params }) => {
    try {
      const positions = await PositionService.getUserPositions(user.id);
      const position = positions.find((p) => p.id === params.id);

      if (!position) {
        return {
          success: false,
          error: "Position not found",
          timestamp: new Date(),
        };
      }

      // Update position with current PnL
      const updatedPosition = await PositionService.updatePositionPnL(
        params.id
      );

      return {
        success: true,
        data: updatedPosition,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  })
  .post("/:id/close", async ({ user, params }) => {
    try {
      const result = await TradingService.closePosition(user.id, params.id);

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  })
  .put(
    "/:id/modify",
    async ({ user, params, body }) => {
      try {
        const result = await TradingService.modifyPosition(
          user.id,
          params.id,
          body
        );

        return {
          success: true,
          data: result,
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
      body: t.Object({
        stopLoss: t.Optional(t.Number()),
        takeProfit: t.Optional(t.Number()),
      }),
    }
  );
