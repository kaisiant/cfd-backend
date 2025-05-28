import bcrypt from "bcryptjs";
import { db } from "../utils/database";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";

export class AuthService {
  static async register(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    jwtInstance: any
  ) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();

    const token = await jwtInstance.sign({ userId: user.id });

    return { user: { ...user, password: undefined }, token };
  }

  static async login(email: string, password: string, jwtInstance: any) {
    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }

    const token = await jwtInstance.sign({ userId: user.id });

    return { user: { ...user, password: undefined }, token };
  }

  static async verifyToken(token: string, jwtInstance: any) {
    try {
      const decoded = await jwtInstance.verify(token);
      return decoded.userId;
    } catch {
      throw new Error("Invalid token");
    }
  }
}
