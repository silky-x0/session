import React, { useEffect, useRef, useState } from "react";
import Editor, { type Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

const LANGUAGES = [
    "javascript",
    "typescript",
    "python",
    "cpp",
    "java",
    "go",
    "html",
    "css",
    "json"
];

const randomColor = () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

const username = "User-" + Math.floor(Math.random() * 1000);
const myId = Math.random().toString(36).substr(2, 9);

const peers = new Map<string, RTCPeerConnection>();

export default function CodeEditor() {
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [inCall, setInCall] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);

    const roomId =
        new URLSearchParams(window.location.search).get("room") || "default";

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        console.log("Editor mounted!");
        setIsEditorReady(true);

        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Use environment variable for WebSocket URL, fallback to localhost
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

        console.log("Connecting to WebSocket:", wsUrl);

        const provider = new WebsocketProvider(
            wsUrl,
            roomId,
            ydoc
        );
        providerRef.current = provider;

        const yText = ydoc.getText("monaco");
        const awareness = provider.awareness;

        // Set local user state for awareness
        awareness.setLocalStateField("user", {
            name: username,
            color: randomColor(),
        });

        // Use y-monaco binding for proper incremental sync
        const model = editor.getModel();
        if (model) {
            const binding = new MonacoBinding(
                yText,
                model,
                new Set([editor]),
                awareness
            );
            bindingRef.current = binding;
        }

        // Language Sync via Y.Map
        const yMeta = ydoc.getMap("meta");
        yMeta.observe(() => {
            const lang = yMeta.get("language") as string;
            if (lang && lang !== language) {
                setLanguage(lang);
                const model = editor.getModel();
                if (model) {
                    monaco.editor.setModelLanguage(model, lang);
                }
            }
        });

        // Initialize language if not set
        if (!yMeta.get("language")) {
            yMeta.set("language", "javascript");
        } else {
            const existingLang = yMeta.get("language") as string;
            setLanguage(existingLang);
            const model = editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, existingLang);
            }
        }
    }

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        setLanguage(lang);
        if (ydocRef.current) {
            const yMeta = ydocRef.current.getMap("meta");
            yMeta.set("language", lang);
        }
    };

    const handleCreateRoom = () => {
        const id = crypto.randomUUID().slice(0, 8);
        window.location.href = `/?room=${id}`;
    };

    const handleStartAudio = async () => {
        if (!providerRef.current) return;
        const ws = providerRef.current.ws;
        if (ws) {
            setInCall(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

                ws.addEventListener("message", async (event: any) => {
                    let data;
                    try {
                        if (typeof event.data === "string") {
                            data = JSON.parse(event.data);
                        }
                    } catch (e) { return; }

                    if (!data) return;

                    if (data.offer) {
                        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
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

                        ws.send(JSON.stringify({ answer, to: data.from, from: myId }));
                    }

                    if (data.answer && data.to === myId) {
                        await peers.get(data.from)?.setRemoteDescription(data.answer);
                    }

                    if (data.candidate && data.to === myId) {
                        await peers.get(data.from)?.addIceCandidate(data.candidate);
                    }

                    if (data.type === "join-audio" && data.from !== myId) {
                        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
                        peers.set(data.from, pc);

                        stream.getTracks().forEach(t => pc.addTrack(t, stream));

                        pc.ontrack = e => {
                            const audio = document.createElement("audio");
                            audio.srcObject = e.streams[0];
                            audio.autoplay = true;
                        };

                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        ws.send(JSON.stringify({ offer, to: data.from, from: myId }));
                    }
                });

                ws.send(JSON.stringify({ type: "join-audio", from: myId }));
            } catch (error) {
                console.error("Audio error:", error);
                setInCall(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            bindingRef.current?.destroy();
            providerRef.current?.destroy();
            ydocRef.current?.destroy();
        };
    }, []);

    return (
        <div style={{ height: "100vh", position: "relative" }}>
            {/* Top Bar */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50px",
                background: "#1e1e1e",
                borderBottom: "1px solid #333",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                zIndex: 10,
                justifyContent: "space-between"
            }}>
                <div style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
                    🚀 Room: <span style={{ fontFamily: "monospace", color: "#4CAF50" }}>{roomId}</span>
                    {isEditorReady && <span style={{ marginLeft: "15px", color: "#4CAF50", fontSize: "12px" }}>● Connected</span>}
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {!inCall && (
                        <button onClick={handleStartAudio} style={{
                            padding: "6px 12px",
                            borderRadius: "4px",
                            border: "none",
                            background: "#2196F3",
                            color: "#fff",
                            cursor: "pointer"
                        }}>
                            📞 Join Audio
                        </button>
                    )}
                    {inCall && <span style={{ color: "#4CAF50", fontSize: "14px" }}>🎤 Audio Active</span>}

                    <button onClick={handleCreateRoom} style={{
                        padding: "6px 12px",
                        borderRadius: "4px",
                        border: "none",
                        background: "#FF9800",
                        color: "#fff",
                        cursor: "pointer"
                    }}>
                        ➕ New Room
                    </button>

                    <select
                        value={language}
                        onChange={handleLanguageChange}
                        style={{
                            padding: "6px 10px",
                            borderRadius: "4px",
                            border: "1px solid #555",
                            background: "#2d2d2d",
                            color: "#fff",
                            cursor: "pointer"
                        }}
                    >
                        {LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>
                                {lang}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ paddingTop: "50px", height: "100%" }}>
                <Editor
                    height="100%"
                    language={language}
                    defaultValue="// Welcome to the collaborative editor!\n// Share the room URL to collaborate in real-time.\n\nconsole.log('Hello, World!');"
                    theme="vs-dark"
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize: 14,
                        minimap: { enabled: true },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}
