import { t } from "elysia";

export const validationSchemas = {
  createOrder: t.Object({
    symbol: t.String({ pattern: "^[A-Z]{6}" }), // e.g., EURUSD
    side: t.Union([t.Literal("buy"), t.Literal("sell")]),
    volume: t.Number({ minimum: 0.01, maximum: 1000 }),
    type: t.Union([t.Literal("market"), t.Literal("limit"), t.Literal("stop")]),
    price: t.Optional(t.Number({ minimum: 0 })),
    stopLoss: t.Optional(t.Number({ minimum: 0 })),
    takeProfit: t.Optional(t.Number({ minimum: 0 })),
    leverage: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
  }),

  updateProfile: t.Object({
    firstName: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
    lastName: t.Optional(t.String({ minLength: 2, maxLength: 50 })),
    leverage: t.Optional(t.Number({ minimum: 1, maximum: 500 })),
  }),
};
