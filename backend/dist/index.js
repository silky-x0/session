"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const socketServer_1 = require("./websocket/socketServer");
const env_1 = require("./config/env");
require("./workers/roomDeletion.worker");
const server = http_1.default.createServer(app_1.default);
// Attach WebSocket server to the same HTTP server
(0, socketServer_1.initializeWebSocketServer)(server);
server.listen(env_1.config.port, () => {
    console.log(`Backend running on :${env_1.config.port}`);
});
