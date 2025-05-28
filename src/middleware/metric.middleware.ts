// src/middleware/metrics.middleware.ts
import { Elysia } from "elysia";
import { register, Counter, Histogram, Gauge } from "prom-client";

register.clear();

// Define metrics
const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route"],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const activeConnections = new Gauge({
  name: "websocket_connections_active",
  help: "Number of active WebSocket connections",
});

const tradingMetrics = {
  tradesTotal: new Counter({
    name: "trades_total",
    help: "Total number of trades executed",
    labelNames: ["symbol", "side", "status"],
  }),

  tradeVolume: new Counter({
    name: "trade_volume_total",
    help: "Total trading volume",
    labelNames: ["symbol"],
  }),

  positionsOpen: new Gauge({
    name: "positions_open_total",
    help: "Number of open positions",
    labelNames: ["symbol"],
  }),

  marginLevel: new Histogram({
    name: "user_margin_level",
    help: "User margin levels",
    buckets: [50, 100, 200, 500, 1000],
  }),

  pnlTotal: new Gauge({
    name: "positions_pnl_total",
    help: "Total P&L of all positions",
  }),
};

export const metricsMiddleware = new Elysia().derive(({ request }) => {
  const startTime = Date.now();

  return {
    startTime,
    recordMetrics: (statusCode: number) => {
      const duration = (Date.now() - startTime) / 1000;
      const method = request.method;
      const route = new URL(request.url).pathname;

      httpRequestsTotal.inc({
        method,
        route,
        status_code: statusCode.toString(),
      });

      httpRequestDuration.observe(
        {
          method,
          route,
        },
        duration
      );
    },
  };
});

// Export trading metrics for use in services
export { tradingMetrics, activeConnections };
