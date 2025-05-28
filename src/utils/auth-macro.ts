import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "./database";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";
import { config } from "../config/env";

export const authMacro = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: config.jwt.expires,
    })
  )
  .macro(({ onBeforeHandle }) => ({
    isAuth(enabled: boolean = true) {
      if (!enabled) return;
      console.log("asdasdasddd");
      onBeforeHandle(async ({ headers, jwt, set }) => {
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

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payload.userId));

        if (!user || !user.isActive) {
          set.status = 401;
          return {
            success: false,
            error: "User not found or inactive",
          };
        }

        return { user };
      });
    },
  }));
