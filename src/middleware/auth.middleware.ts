import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../utils/database";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";
import { config } from "../config/env";

export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: config.jwt.expires,
    })
  )
  .derive(async ({ headers, jwt }) => {
    console.log("ggggg");
    const authorization = headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new Error("Authorization header required");
    }

    const token = authorization.slice(7);
    const payload = await jwt.verify(token);

    if (!payload) {
      throw new Error("Invalid token");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId));
    if (!user || !user.isActive) {
      throw new Error("User not found or inactive");
    }

    return { user };
  });
