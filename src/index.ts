import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { authController } from "./controllers/auth.controller";
import { tradingController } from "./controllers/trading.controller";
import { positionsController } from "./controllers/position.controller";
import { ordersController } from "./controllers/order.controller";
import { marketDataController } from "./controllers/market-data.controller";
import { accountsController } from "./controllers/accounts.controller";
import { riskController } from "./controllers/risk.controller";
import { WebSocketManager } from "./utils/websocket";
import { MarketMonitorService } from "./services/market-monitor.service";
import { rateLimitMiddleware } from "./middleware/rate-limit.middleware";
import { config } from "./config/env";
import { logger } from "./utils/logger";
import { authMacro } from "./utils/auth-macro";
import { metricsMiddleware } from "./middleware/metric.middleware";
import { metricsController } from "./controllers/metrics.controller";
import jwt from "@elysiajs/jwt";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(",") || [
        "http://localhost:3000",
      ],
      credentials: true,
    })
  )
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: config.jwt.expires,
    })
  )
  .use(metricsMiddleware)
  .use(rateLimitMiddleware(1000, 60000)) // Global rate limiting
  .use(
    swagger({
      documentation: {
        info: {
          title: "CFD Brokerage API",
          version: "1.0.0",
          description: "Professional CFD trading platform with B-book model",
          contact: {
            name: "API Support",
            email: "support@cfdbroker.com",
          },
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: "Development server",
          },
        ],
        tags: [
          {
            name: "Authentication",
            description: "User authentication and registration",
          },
          {
            name: "Trading",
            description: "Position management and trading operations",
          },
          {
            name: "Orders",
            description: "Order management (pending, market, limit)",
          },
          {
            name: "Market Data",
            description: "Real-time market prices and symbols",
          },
          {
            name: "Account",
            description: "Account balance, deposits, withdrawals",
          },
          {
            name: "Risk Management",
            description: "Risk monitoring and limits",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [{ bearerAuth: [] }],
      },
      path: "/docs",
    })
  )
  .get("/", () => ({
    service: "CFD Brokerage API",
    version: "1.0.0",
    status: "operational",
    timestamp: new Date(),
    endpoints: {
      docs: "/docs",
      health: "/health",
      websocket: `ws://localhost:8080`,
    },
  }))
  .use(metricsController)
  .use(authController)
  // .use(authMacro)
  .use(tradingController)
  .use(positionsController)
  .use(ordersController)
  .use(marketDataController)
  .use(accountsController)
  .use(riskController)
  .onError(({ error, code, recordMetrics }) => {
    logger.error(`API Error [${code}]:`, error);

    const statusCode = code === "NOT_FOUND" ? 404 : 500;
    recordMetrics?.(statusCode);

    if (code === "VALIDATION") {
      return {
        success: false,
        error: "Validation failed",
        details: error.message,
        timestamp: new Date(),
      };
    }

    if (code === "NOT_FOUND") {
      return {
        success: false,
        error: "Endpoint not found",
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      error: error.message || "Internal server error",
      timestamp: new Date(),
    };
  })
  // Success response metrics
  .onAfterHandle(({ response, recordMetrics }) => {
    recordMetrics?.(200);
    return response;
  })
  .listen(3000);

// Start WebSocket server
const wsManager = new WebSocketManager(8080);

// Start market monitoring
MarketMonitorService.startMonitoring();

logger.info(`🦊 CFD Brokerage API running at http://localhost:${config.port}`);
logger.info(`📡 WebSocket server running at ws://localhost:8080`);
logger.info(`📚 API Documentation at http://localhost:${config.port}/docs`);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Received SIGINT, shutting down gracefully");
  process.exit(0);
});

export default app;
