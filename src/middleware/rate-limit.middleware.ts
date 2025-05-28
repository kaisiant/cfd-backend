import { Elysia } from "elysia";
import { redis } from "../utils/redis";

export const rateLimitMiddleware = (
  maxRequests: number = 100,
  windowMs: number = 60000
) => {
  return new Elysia().derive(async ({ request, headers }) => {
    const ip = headers["x-forwarded-for"] || headers["x-real-ip"] || "unknown";
    const key = `rate_limit:${ip}`;

    try {
      // Ensure Redis is connected
      if (redis.status !== "ready") {
        await redis.connect();
      }

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > maxRequests) {
        throw new Error("Rate limit exceeded");
      }
    } catch (error) {
      console.error("Rate limit error:", error);
      // Allow request if Redis is down (fail open)
    }

    return {};
  });
};
