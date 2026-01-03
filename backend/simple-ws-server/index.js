const http = require("http");
const { WebSocketServer } = require("ws");
const Y = require("yjs");
const syncProtocol = require("y-protocols/sync");
const awarenessProtocol = require("y-protocols/awareness");
const encoding = require("lib0/encoding");
const decoding = require("lib0/decoding");

const server = http.createServer();
const wss = new WebSocketServer({ server });

// Store documents and awareness per room
const docs = new Map();
const awarenessStates = new Map();

const messageSync = 0;
const messageAwareness = 1;

function getYDoc(roomName) {
    if (!docs.has(roomName)) {
        docs.set(roomName, new Y.Doc());
    }
    return docs.get(roomName);
}

function getAwareness(roomName) {
    if (!awarenessStates.has(roomName)) {
        const ydoc = getYDoc(roomName);
        const awareness = new awarenessProtocol.Awareness(ydoc);
        awarenessStates.set(roomName, awareness);
    }
    return awarenessStates.get(roomName);
}

wss.on("connection", (ws, req) => {
    // Extract room from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
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

    const messageHandler = (message) => {
        try {
            // First, check if this is a JSON signaling message (string)
            if (typeof message === "string") {
                try {
                    const data = JSON.parse(message);
                    if (data.type === "signal") {
                        console.log(`Signaling message from client in room ${roomName}:`, data.from);

                        // If there's a specific target, send only to that client
                        if (data.to) {
                            wss.clients.forEach((client) => {
                                if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                    client.send(message);
                                }
                            });
                        } else {
                            // Broadcast to all other clients in the room
                            wss.clients.forEach((client) => {
                                if (client !== ws && client.readyState === 1 && client.room === roomName) {
                                    client.send(message);
                                }
                            });
                        }
                        return;
                    }
                } catch (e) {
                    // Not JSON, continue to binary handling
                }
            }

            // Handle binary messages (Yjs protocol)
            const uint8Msg = new Uint8Array(message);

            // Check if it might be a JSON string sent as buffer
            try {
                const str = new TextDecoder().decode(uint8Msg);
                const data = JSON.parse(str);
                if (data.type === "signal") {
                    console.log(`Signaling message (buffer) from client in room ${roomName}:`, data.from);

                    // Broadcast to all other clients in the room
                    wss.clients.forEach((client) => {
                        if (client !== ws && client.readyState === 1 && client.room === roomName) {
                            client.send(str); // Send as string
                        }
                    });
                    return;
                }
            } catch (e) {
                // Not JSON, continue to Yjs protocol
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
            } else if (messageType === messageAwareness) {
                awarenessProtocol.applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), ws);

                // Broadcast awareness to other clients
                wss.clients.forEach((client) => {
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
        // Clean up awareness - the awareness protocol handles this automatically
        // when the connection is closed, so we don't need explicit cleanup
    });
});

// Ping interval to keep connections alive
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

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Yjs WebSocket server running on :${PORT}`);
    console.log("Listening on all network interfaces (0.0.0.0)");
});
