import { db } from "../utils/database";
import { users } from "../models/user.model";
import { eq } from "drizzle-orm";
import { PositionService } from "./position.service";

export class AccountService {
  static async getAccountBalance(userId: string) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      throw new Error("User not found");
    }

    // Update equity with current position values
    const equity = await this.calculateEquity(userId);

    await db
      .update(users)
      .set({ equity: equity.toString() })
      .where(eq(users.id, userId));

    return {
      balance: parseFloat(user.balance),
      equity,
      margin: parseFloat(user.margin),
      freeMargin: equity - parseFloat(user.margin),
      marginLevel:
        parseFloat(user.margin) > 0
          ? (equity / parseFloat(user.margin)) * 100
          : 0,
    };
  }

  static async getAccountSummary(userId: string) {
    const balance = await this.getAccountBalance(userId);
    const positions = await PositionService.getUserPositions(userId, "open");

    const totalPnL = positions.reduce(
      (sum, pos) => sum + parseFloat(pos.pnl),
      0
    );
    const totalSwap = positions.reduce(
      (sum, pos) => sum + parseFloat(pos.swap),
      0
    );
    const totalCommission = positions.reduce(
      (sum, pos) => sum + parseFloat(pos.commission),
      0
    );

    return {
      ...balance,
      openPositions: positions.length,
      totalPnL,
      totalSwap,
      totalCommission,
      profitablePositions: positions.filter((p) => parseFloat(p.pnl) > 0)
        .length,
    };
  }

  static async processDeposit(
    userId: string,
    depositData: {
      amount: number;
      method: string;
      reference?: string;
    }
  ) {
    // In real implementation, integrate with payment processors
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const newBalance = parseFloat(user.balance) + depositData.amount;

    await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId));

    // Log transaction
    await this.logTransaction(userId, {
      type: "deposit",
      amount: depositData.amount,
      method: depositData.method,
      reference: depositData.reference,
      status: "completed",
    });

    return {
      transactionId: this.generateTransactionId(),
      amount: depositData.amount,
      newBalance,
      status: "completed",
    };
  }

  static async processWithdrawal(
    userId: string,
    withdrawalData: {
      amount: number;
      method: string;
      destination: string;
    }
  ) {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const currentBalance = parseFloat(user.balance);

    if (currentBalance < withdrawalData.amount) {
      throw new Error("Insufficient balance");
    }

    // Check if user has open positions
    const openPositions = await PositionService.getUserPositions(
      userId,
      "open"
    );
    if (openPositions.length > 0) {
      throw new Error("Cannot withdraw with open positions");
    }

    const newBalance = currentBalance - withdrawalData.amount;

    await db
      .update(users)
      .set({ balance: newBalance.toString() })
      .where(eq(users.id, userId));

    // Log transaction
    await this.logTransaction(userId, {
      type: "withdrawal",
      amount: -withdrawalData.amount,
      method: withdrawalData.method,
      destination: withdrawalData.destination,
      status: "pending",
    });

    return {
      transactionId: this.generateTransactionId(),
      amount: withdrawalData.amount,
      newBalance,
      status: "pending",
    };
  }

  private static async calculateEquity(userId: string): Promise<number> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const balance = parseFloat(user.balance);

    const openPositions = await PositionService.getUserPositions(
      userId,
      "open"
    );
    const totalPnL = openPositions.reduce(
      (sum, pos) => sum + parseFloat(pos.pnl),
      0
    );

    return balance + totalPnL;
  }

  private static async logTransaction(userId: string, transactionData: any) {
    // In real implementation, store in transactions table
    console.log("Transaction logged:", { userId, ...transactionData });
  }

  private static generateTransactionId(): string {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async getTransactionHistory(userId: string, limit = 50, offset = 0) {
    // Mock transaction history - implement with real transactions table
    return [
      {
        id: "TXN_1234567890_abc123",
        type: "deposit",
        amount: 1000,
        method: "card",
        status: "completed",
        timestamp: new Date(),
      },
    ];
  }
}
