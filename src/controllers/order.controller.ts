import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth.middleware";
import { OrderService } from "../services/order.service";
import { validationSchemas } from "../middleware/validation.middleware";

export const ordersController = new Elysia({ prefix: "/orders" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ user, body }) => {
      try {
        const order = await OrderService.createOrder(user.id, body);

        return {
          success: true,
          data: order,
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
      body: validationSchemas.createOrder,
    }
  )
  .get(
    "/",
    async ({ user, query }) => {
      try {
        const orders = await OrderService.getUserOrders(
          user.id,
          query.status as string
        );

        return {
          success: true,
          data: orders,
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
        status: t.Optional(t.String()),
        limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Number({ minimum: 0 })),
      }),
    }
  )
  .delete("/:id", async ({ user, params }) => {
    try {
      const result = await OrderService.cancelOrder(user.id, params.id);

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
  });
