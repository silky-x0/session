import http from "http";
import app from "./app";
import { initializeWebSocketServer } from "./websocket/socketServer";
import { config } from "./config/env";
import "./workers/roomDeletion.worker";

const server = http.createServer(app);

// Attach WebSocket server to the same HTTP server
initializeWebSocketServer(server);

server.listen(config.port, () => {
    console.log(`Backend running on :${config.port}`);
});

