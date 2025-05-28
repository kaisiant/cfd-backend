import { Elysia } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { RiskService } from "../services/risk.service";

export const riskController = new Elysia({ prefix: "/risk" })
  .use(authMiddleware)
  .get("/margin-level", async ({ user }) => {
    try {
      const marginLevel = await RiskService.getMarginLevel(user.id);

      return {
        success: true,
        data: {
          marginLevel,
          marginCall: marginLevel < 100,
          stopOut: marginLevel < 50,
        },
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
  .get("/exposure", async ({ user }) => {
    try {
      const exposure = await RiskService.getPortfolioExposure(user.id);

      return {
        success: true,
        data: exposure,
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
  .get("/limits", async ({ user }) => {
    try {
      const limits = await RiskService.getUserLimits(user.id);

      return {
        success: true,
        data: limits,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  });
