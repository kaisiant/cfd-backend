import { Elysia } from "elysia";
import { register } from "prom-client";

export const metricsController = new Elysia()
  .get("/metrics", async () => {
    const metrics = await register.metrics();
    return new Response(metrics, {
      headers: {
        "Content-Type": register.contentType,
      },
    });
  })
  .get("/health", () => {
    // Health checks for dependencies
    const checks = {
      database: "healthy", // In real app, ping database
      redis: "healthy", // In real app, ping redis
      websocket: "healthy",
      marketData: "healthy",
    };

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks,
    };
  });
