import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "../services/auth.service";
import { config } from "../config/env";

export const authController = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: config.jwt.secret,
      exp: config.jwt.expires,
    })
  )
  .post(
    "/register",
    async ({ body, jwt }) => {
      try {
        const result = await AuthService.register(body, jwt);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        firstName: t.String(),
        lastName: t.String(),
      }),
    }
  )
  .post(
    "/login",
    async ({ body, jwt }) => {
      try {
        const result = await AuthService.login(body.email, body.password, jwt);
        return {
          success: true,
          data: result,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .post(
    "/verify",
    async ({ body, jwt }) => {
      try {
        const userId = await AuthService.verifyToken(body.token, jwt);
        return {
          success: true,
          data: { userId },
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    },
    {
      body: t.Object({
        token: t.String(),
      }),
    }
  );
