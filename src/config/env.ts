export const config = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    name: process.env.DB_NAME || "cfd_brokerage",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "redispassword", // Add password config
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-key",
    expires: process.env.JWT_EXPIRES || "24h",
  },
  trading: {
    maxLeverage: 500,
    minMargin: 0.002,
    maxPositionSize: 1000000,
  },
};
