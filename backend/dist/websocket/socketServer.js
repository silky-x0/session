"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWebSocketServer = void 0;
const ws_1 = require("ws");
const syncProtocol = __importStar(require("y-protocols/sync"));
const awarenessProtocol = __importStar(require("y-protocols/awareness"));
const encoding = __importStar(require("lib0/encoding"));
const decoding = __importStar(require("lib0/decoding"));
const yjs_service_1 = require("../services/yjs.service");
const awarenessStates = new Map();
const messageSync = 0;
const messageAwareness = 1;
const getAwareness = (roomName) => {
    if (!awarenessStates.has(roomName)) {
        const ydoc = (0, yjs_service_1.getYDoc)(roomName);
        const awareness = new awarenessProtocol.Awareness(ydoc);
        awarenessStates.set(roomName, awareness);
    }
    return awarenessStates.get(roomName);
};
const initializeWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (ws, req) => {
        // Extract room from URL
        const url = new URL(req.url, `http://${req.headers.host}`);
        const roomName = url.pathname.slice(1) || "default";
        console.log(`Client connected to room: ${roomName}`);
        const ydoc = (0, yjs_service_1.getYDoc)(roomName);
        const awareness = getAwareness(roomName);
        ws.room = roomName;
        ws.isAlive = true;
        // Send sync step 1
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.writeSyncStep1(encoder, ydoc);
        ws.send(encoding.toUint8Array(encoder));
        // Send awareness state
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, messageAwareness);
        encoding.writeVarUint8Array(awarenessEncoder, awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())));
        ws.send(encoding.toUint8Array(awarenessEncoder));
        const messageHandler = (message) => {
            try {
                // First, check if this is a JSON signaling message (string)
                if (typeof message === "string") {
                    try {
                        const data = JSON.parse(message);
                        if (data.type === "signal") {
                            // Forward signaling message
                            wss.clients.forEach((client) => {
                                if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                    client.send(message);
                                }
                            });
                            return;
                        }
                    }
                    catch (e) {
                        // Not JSON
                    }
                }
                const uint8Msg = new Uint8Array(message);
                // Check if it might be a JSON string sent as buffer
                try {
                    const str = new TextDecoder().decode(uint8Msg);
                    const data = JSON.parse(str);
                    if (data.type === "signal") {
                        // Broadcast to all other clients in the room
                        wss.clients.forEach((client) => {
                            if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                client.send(str);
                            }
                        });
                        return;
                    }
                }
                catch (e) {
                    // Not JSON
                }
                const decoder = decoding.createDecoder(uint8Msg);
                const messageType = decoding.readVarUint(decoder);
                if (messageType === messageSync) {
                    const syncEncoder = encoding.createEncoder();
                    encoding.writeVarUint(syncEncoder, messageSync);
                    syncProtocol.readSyncMessage(decoder, syncEncoder, ydoc, ws);
                    if (encoding.length(syncEncoder) > 1) {
                        ws.send(encoding.toUint8Array(syncEncoder));
                    }
                    // Broadcast to other clients
                    wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === 1 && client.room === roomName) {
                            client.send(message);
                        }
                    });
                }
                else if (messageType === messageAwareness) {
                    awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), ws);
                    // Broadcast awareness to other clients
                    wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === 1 && client.room === roomName) {
                            client.send(message);
                        }
                    });
                }
            }
            catch (err) {
                console.error("Message handling error:", err);
            }
        };
        ws.on("message", messageHandler);
        ws.on("pong", () => {
            ws.isAlive = true;
        });
        ws.on("close", () => {
            console.log(`Client disconnected from room: ${roomName}`);
        });
    });
    // Ping interval
    const pingInterval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if (!ws.isAlive) {
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);
    wss.on("close", () => {
        clearInterval(pingInterval);
    });
    return wss;
};
exports.initializeWebSocketServer = initializeWebSocketServer;
