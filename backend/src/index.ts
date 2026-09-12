import http from "http";
import app from "./app";
import { initializeWebSocketServer } from "./websocket/socketServer";
import { config } from "./config/env";
import "./workers/roomDeletion.worker";
import { closeRoomDeletionWorker } from "./workers/roomDeletion.worker";
import { closeRoomDeletionQueue } from "./queues/roomDeletion.queue";
import { redisConnection } from "./config/redis";

const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
initializeWebSocketServer(server);

server.listen(config.port, () => {
    console.log(`Backend running on :${config.port}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully…`);
  server.close();
  try {
    await closeRoomDeletionWorker();
  } catch (err) {
    console.error("Error closing room-deletion worker:", err);
  }
  try {
    await closeRoomDeletionQueue();
  } catch (err) {
    console.error("Error closing room-deletion queue:", err);
  }
  redisConnection.disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
