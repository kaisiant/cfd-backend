import { Elysia } from "elysia";
import { RiskService } from "../services/risk.service";

export const riskMiddleware = new Elysia().derive(async ({ user, body }) => {
  if (user && body && typeof body === "object") {
    // Check for margin call
    const isMarginCall = await RiskService.checkMarginCall(user.id);
    if (isMarginCall) {
      throw new Error("Account under margin call - trading suspended");
    }

    // Additional risk checks based on request type
    if ("volume" in body && "symbol" in body) {
      await RiskService.validateTradeSize(user.id, body as any);
    }
  }

  return {};
});
