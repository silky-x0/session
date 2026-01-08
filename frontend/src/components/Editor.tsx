import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor, { type Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { startAudio, stopAudio } from "../hooks/useAudioCall";
import ProblemPanel from "./ProblemPanel";

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

interface Metadata {
    title?: string;
    difficulty?: string;
    question?: string;
    hints?: string[];
    complexity?: { time: string; space: string };
    fullSolution?: string;
    starterCode?: string;
}

export default function CodeEditor() {
    const navigate = useNavigate();
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [inCall, setInCall] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(false);
    const [metadata, setMetadata] = useState<Metadata>({});

    const roomId =
        new URLSearchParams(window.location.search).get("room") || "default";

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        console.log("Editor mounted!");
        setIsEditorReady(true);

        const ydoc = new Y.Doc();
        ydocRef.current = ydoc;

        // Use environment variable for WebSocket URL, fallback to localhost
        const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:1234";

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

        // Metadata Sync via Y.Map
        const yMeta = ydoc.getMap("meta");
        
        // Function to read all metadata
        const updateMetadata = () => {
            const lang = yMeta.get("language") as string;
            if (lang && lang !== language) {
                setLanguage(lang);
                const model = editor.getModel();
                if (model) {
                    monaco.editor.setModelLanguage(model, lang);
                }
            }

            // Read all metadata fields
            setMetadata({
                title: yMeta.get("title") as string | undefined,
                difficulty: yMeta.get("difficulty") as string | undefined,
                question: yMeta.get("question") as string | undefined,
                hints: yMeta.get("hints") ? JSON.parse(yMeta.get("hints") as string) : undefined,
                complexity: yMeta.get("complexity") ? JSON.parse(yMeta.get("complexity") as string) : undefined,
                fullSolution: yMeta.get("fullSolution") as string | undefined,
                starterCode: yMeta.get("starterCode") as string | undefined,
            });
        };

        // Observe metadata changes
        yMeta.observe(updateMetadata);

        // Initialize language and metadata if not set
        if (!yMeta.get("language")) {
            yMeta.set("language", "javascript");
        } else {
            updateMetadata();
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
        navigate(`/editor?room=${id}`);
    };

    const handleStartAudio = async () => {
        if (!providerRef.current) return;
        const ws = providerRef.current.ws;
        if (ws) {
            try {
                await startAudio(ws);
                setInCall(true);
            } catch (error) {
                console.error("Audio error:", error);
                setInCall(false);
            }
        }
    };

    useEffect(() => {
        return () => {
            stopAudio();
            bindingRef.current?.destroy();
            providerRef.current?.destroy();
            ydocRef.current?.destroy();
        };
    }, []);

    return (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Top Bar */}
            <div style={{
                height: "50px",
                background: "#1e1e1e",
                borderBottom: "1px solid #333",
                display: "flex",
                alignItems: "center",
                padding: "0 15px",
                zIndex: 10,
                justifyContent: "space-between",
                flexShrink: 0
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

            {/* Problem Panel - conditionally shown */}
            {metadata.title && (
                <ProblemPanel metadata={metadata} />
            )}

            <div style={{ flex: 1, overflow: "hidden" }}>
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
