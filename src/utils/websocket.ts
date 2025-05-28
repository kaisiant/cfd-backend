// src/utils/websocket.ts
import { WebSocketServer } from "ws";
import { redis, pubsub } from "./redis";
import { AuthService } from "../services/auth.service";

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupEventHandlers();
    this.setupRedisSubscriptions();
  }

  private setupEventHandlers() {
    this.wss.on("connection", (ws, request) => {
      ws.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          ws.send(JSON.stringify({ error: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        this.clients.delete(ws);
      });
    });
  }

  private async handleMessage(ws: any, message: any) {
    switch (message.type) {
      case "auth":
        try {
          const userId = await AuthService.verifyToken(message.token);
          this.clients.set(ws, { userId, subscriptions: [] });
          ws.send(JSON.stringify({ type: "auth", success: true }));
        } catch {
          ws.send(JSON.stringify({ type: "auth", success: false }));
        }
        break;

      case "subscribe":
        const client = this.clients.get(ws);
        if (client) {
          client.subscriptions.push(message.channel);
          ws.send(
            JSON.stringify({
              type: "subscribed",
              channel: message.channel,
            })
          );
        }
        break;
    }
  }

  private setupRedisSubscriptions() {
    pubsub.subscriber.psubscribe("price:*");
    pubsub.subscriber.on("pmessage", (pattern, channel, message) => {
      this.broadcast(channel, JSON.parse(message));
    });
  }

  private broadcast(channel: string, data: any) {
    this.clients.forEach((client, ws) => {
      if (client.subscriptions.includes(channel)) {
        ws.send(
          JSON.stringify({
            type: "update",
            channel,
            data,
          })
        );
      }
    });
  }
}
