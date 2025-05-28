import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { validationSchemas } from "../middleware/validation.middleware";
import { AccountService } from "../services/account.service";

export const accountsController = new Elysia({ prefix: "/account" })
  .use(authMiddleware)
  .get("/balance", async ({ user }) => {
    try {
      const balance = await AccountService.getAccountBalance(user.id);

      return {
        success: true,
        data: balance,
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
  .get("/summary", async ({ user }) => {
    try {
      const summary = await AccountService.getAccountSummary(user.id);

      return {
        success: true,
        data: summary,
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
  .post(
    "/deposit",
    async ({ user, body }) => {
      try {
        const result = await AccountService.processDeposit(user.id, body);

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
        amount: t.Number({ minimum: 10, maximum: 100000 }),
        method: t.Union([
          t.Literal("card"),
          t.Literal("bank"),
          t.Literal("crypto"),
        ]),
        reference: t.Optional(t.String()),
      }),
    }
  )
  .post(
    "/withdraw",
    async ({ user, body }) => {
      try {
        const result = await AccountService.processWithdrawal(user.id, body);

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
        amount: t.Number({ minimum: 10 }),
        method: t.Union([
          t.Literal("card"),
          t.Literal("bank"),
          t.Literal("crypto"),
        ]),
        destination: t.String(),
      }),
    }
  )
  .get(
    "/transactions",
    async ({ user, query }) => {
      try {
        const transactions = await AccountService.getTransactionHistory(
          user.id,
          query.limit,
          query.offset
        );

        return {
          success: true,
          data: transactions,
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
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Number({ minimum: 0 })),
        type: t.Optional(t.String()),
      }),
    }
  );
