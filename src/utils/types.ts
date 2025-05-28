export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  balance: string;
  equity: string;
  margin: string;
  freeMargin: string;
  leverage: number;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  userId: string;
  symbol: string;
  side: "buy" | "sell";
  volume: string;
  openPrice: string;
  currentPrice: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  swap: string;
  commission: string;
  pnl: string;
  margin: string;
  status: "open" | "closed";
  openedAt: Date;
  closedAt: Date | null;
}

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  volume: string;
  price: string | null;
  stopLoss: string | null;
  takeProfit: string | null;
  status: "pending" | "executed" | "cancelled" | "failed";
  createdAt: Date;
  executedAt: Date | null;
  cancelledAt: Date | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
