
const peers = new Map<string, RTCPeerConnection>();

const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export async function startAudio(socket: WebSocket) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    socket.onmessage = async (msg) => {
        let data;
        try {
            data = JSON.parse(msg.data);
        } catch (e) {
            // Ignored, might be yjs binary
            return;
        }

        // Ignore if it's not signaling data
        if (!data || (!data.offer && !data.answer && !data.candidate)) return;

        if (data.offer) {
            const pc = new RTCPeerConnection(config);
            // Use the 'from' field to identify the peer
            peers.set(data.from, pc);

            stream.getTracks().forEach(t => pc.addTrack(t, stream));

            pc.ontrack = e => {
                const audio = document.createElement("audio");
                audio.srcObject = e.streams[0];
                audio.autoplay = true;
            };

            await pc.setRemoteDescription(data.offer);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send answer back to the specific peer
            socket.send(JSON.stringify({ answer, to: data.from }));
        }

        if (data.answer) {
            // 'from' here is the one who answered
            await peers.get(data.from)?.setRemoteDescription(data.answer);
        }

        if (data.candidate) {
            // 'from' sent a candidate
            await peers.get(data.from)?.addIceCandidate(data.candidate);
        }
    };
}
