import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../config/env";

export const jwtMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: config.jwt.expires,
    })
  )
  .guard({
    beforeHandle: async ({ headers, jwt, set }) => {
      const authorization = headers.authorization;

      if (!authorization?.startsWith("Bearer ")) {
        set.status = 401;
        return {
          success: false,
          error: "Authorization header required",
        };
      }

      const token = authorization.slice(7);
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return {
          success: false,
          error: "Invalid token",
        };
      }

      return { userId: payload.userId };
    },
  });
