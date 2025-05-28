import Redis from "ioredis";
import { config } from "../config/env";

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password, // Add password support
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Don't connect immediately
  enableOfflineQueue: false,
  // Connection timeout
  connectTimeout: 10000,
  commandTimeout: 5000,
});

export const pubsub = {
  publisher: new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    lazyConnect: true,
  }),
  subscriber: new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    lazyConnect: true,
  }),
};

// Error handling
redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("ready", () => {
  console.log("✅ Redis is ready");
});

pubsub.publisher.on("error", (err) => {
  console.error("Redis publisher error:", err);
});

pubsub.subscriber.on("error", (err) => {
  console.error("Redis subscriber error:", err);
});
