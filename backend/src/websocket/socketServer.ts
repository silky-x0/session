import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { getYDoc } from "../services/yjs.service";

const awarenessStates = new Map<string, awarenessProtocol.Awareness>();

const messageSync = 0;
const messageAwareness = 1;

interface EnhancedWebSocket extends WebSocket {
    room: string;
    isAlive: boolean;
}

const getAwareness = (roomName: string): awarenessProtocol.Awareness => {
    if (!awarenessStates.has(roomName)) {
        const ydoc = getYDoc(roomName);
        const awareness = new awarenessProtocol.Awareness(ydoc);
        awarenessStates.set(roomName, awareness);
    }
    return awarenessStates.get(roomName)!;
};

export const initializeWebSocketServer = (server: Server) => {
    const wss = new WebSocketServer({ server });

    wss.on("connection", (ws: EnhancedWebSocket, req) => {
        // Extract room from URL
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const roomName = url.pathname.slice(1) || "default";

        console.log(`Client connected to room: ${roomName}`);

        const ydoc = getYDoc(roomName);
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
        encoding.writeVarUint8Array(
            awarenessEncoder,
            awarenessProtocol.encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))
        );
        ws.send(encoding.toUint8Array(awarenessEncoder));

        const messageHandler = (message: ArrayBuffer) => {
            try {
                 // First, check if this is a JSON signaling message (string)
                if (typeof message === "string") {
                    try {
                        const data = JSON.parse(message);
                        if (data.type === "signal") {
                            // Forward signaling message
                            wss.clients.forEach((client: any) => {
                                if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                    client.send(message);
                                }
                            });
                            return;
                        }
                    } catch (e) {
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
                       wss.clients.forEach((client: any) => {
                            if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                client.send(str); 
                            }
                        });
                        return;
                    }
                } catch(e) {
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
                    wss.clients.forEach((client: any) => {
                        if (client !== ws && client.readyState === 1 && client.room === roomName) {
                            client.send(message);
                        }
                    });
                } else if (messageType === messageAwareness) {
                    awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), ws);

                    // Broadcast awareness to other clients
                    wss.clients.forEach((client: any) => {
                        if (client !== ws && client.readyState === 1 && client.room === roomName) {
                            client.send(message);
                        }
                    });
                }
            } catch (err) {
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
        wss.clients.forEach((ws: any) => {
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
