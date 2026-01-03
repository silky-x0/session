const peers = new Map<string, RTCPeerConnection>();
let localStream: MediaStream | null = null;
let currentSocket: WebSocket | null = null;
let clientId: string = Math.random().toString(36).substring(2, 15);

const config: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

function createPeerConnection(peerId: string, socket: WebSocket): RTCPeerConnection {
    const pc = new RTCPeerConnection(config);
    peers.set(peerId, pc);

    // Add local stream tracks
    if (localStream) {
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream!));
    }

    // Handle ICE candidates - send them to the remote peer
    pc.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("Sending ICE candidate to:", peerId);
            socket.send(JSON.stringify({
                type: "signal",
                candidate: event.candidate,
                to: peerId,
                from: clientId
            }));
        }
    };

    pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state with ${peerId}:`, pc.iceConnectionState);
    };

    pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerId}:`, pc.connectionState);
    };

    // Handle incoming tracks - create audio element and append to DOM
    pc.ontrack = (event) => {
        console.log("Received remote track from:", peerId);
        const audio = document.createElement("audio");
        audio.id = `audio-${peerId}`;
        audio.srcObject = event.streams[0];
        audio.autoplay = true;
        // Append to DOM so it can play
        document.body.appendChild(audio);
        console.log("Audio element created and appended for peer:", peerId);
    };

    return pc;
}

export async function startAudio(socket: WebSocket): Promise<void> {
    currentSocket = socket;

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Got local audio stream");
    } catch (err) {
        console.error("Failed to get audio stream:", err);
        throw err;
    }

    // Handle incoming signaling messages
    const originalOnMessage = socket.onmessage;
    socket.onmessage = async (msg) => {
        // First try to parse as signaling data
        let data;
        try {
            if (typeof msg.data === "string") {
                data = JSON.parse(msg.data);
            } else {
                // Call original handler for binary data (Yjs)
                if (originalOnMessage) {
                    originalOnMessage.call(socket, msg);
                }
                return;
            }
        } catch (e) {
            // Not JSON, likely Yjs binary - call original handler
            if (originalOnMessage) {
                originalOnMessage.call(socket, msg);
            }
            return;
        }

        // Ignore if it's not signaling data
        if (!data || data.type !== "signal") {
            if (originalOnMessage) {
                originalOnMessage.call(socket, msg);
            }
            return;
        }

        // Ignore messages from ourselves or not meant for us
        if (data.from === clientId) return;
        if (data.to && data.to !== clientId) return;

        console.log("Received signaling message:", data);

        if (data.offer) {
            console.log("Received offer from:", data.from);
            const pc = createPeerConnection(data.from, socket);

            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("Sending answer to:", data.from);
            socket.send(JSON.stringify({
                type: "signal",
                answer: answer,
                to: data.from,
                from: clientId
            }));
        }

        if (data.answer) {
            console.log("Received answer from:", data.from);
            const pc = peers.get(data.from);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        }

        if (data.candidate) {
            console.log("Received ICE candidate from:", data.from);
            const pc = peers.get(data.from);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            }
        }

        // When another peer joins, initiate a call to them
        if (data.join) {
            console.log("Peer joined, initiating call to:", data.from);
            const pc = createPeerConnection(data.from, socket);

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            console.log("Sending offer to:", data.from);
            socket.send(JSON.stringify({
                type: "signal",
                offer: offer,
                to: data.from,
                from: clientId
            }));
        }
    };

    // Announce presence to initiate calls with existing peers
    socket.send(JSON.stringify({
        type: "signal",
        join: true,
        from: clientId
    }));
}

// Call this to initiate a call to a specific peer
export async function callPeer(peerId: string): Promise<void> {
    if (!currentSocket || !localStream) {
        console.error("Audio not started. Call startAudio first.");
        return;
    }

    console.log("Initiating call to:", peerId);
    const pc = createPeerConnection(peerId, currentSocket);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    currentSocket.send(JSON.stringify({
        type: "signal",
        offer: offer,
        to: peerId,
        from: clientId
    }));
}

// Get current client ID for debugging
export function getClientId(): string {
    return clientId;
}

// Cleanup function
export function stopAudio(): void {
    peers.forEach((pc, id) => {
        pc.close();
        const audio = document.getElementById(`audio-${id}`);
        if (audio) {
            audio.remove();
        }
    });
    peers.clear();

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }

    currentSocket = null;
}
