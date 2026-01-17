import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { type Monaco } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { startAudio, stopAudio } from "../hooks/useAudioCall";
import { CodeEditor } from "./editor/CodeEditor";
import { TopBar } from "./editor/TopBar";
import { ProblemPanel } from "./editor/ProblemPanel";
import { AIChat } from "./editor/AIChat";
import { OutputPanel } from "./editor/OutputPanel";
import { motion } from "framer-motion";

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

export default function CollaborativeEditor() {
    const navigate = useNavigate();
    const ydocRef = useRef<Y.Doc | null>(null);
    const providerRef = useRef<WebsocketProvider | null>(null);
    const bindingRef = useRef<MonacoBinding | null>(null);
    const yMetaObserverRef = useRef<(() => void) | null>(null);
    const [language, setLanguage] = useState("javascript");
    const [inCall, setInCall] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [metadata, setMetadata] = useState<Metadata>({});

    const roomId =
        new URLSearchParams(window.location.search).get("room") || "default";

    function handleEditorDidMount(editor: any, monaco: Monaco) {
        console.log("Editor mounted!");
        
        // Custom theme definition to match design
        monaco.editor.defineTheme("neon-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
                { token: "comment", foreground: "6A9955", fontStyle: "italic" },
                { token: "keyword", foreground: "4EC9B0" },
                { token: "string", foreground: "CE9178" },
                { token: "number", foreground: "B5CEA8" },
                { token: "type", foreground: "4EC9B0" },
                { token: "function", foreground: "DCDCAA" },
                { token: "variable", foreground: "9CDCFE" },
            ],
            colors: {
                "editor.background": "#05050500", // Transparent to show through glass
                "editor.foreground": "#E0E0E0",
                "editor.lineHighlightBackground": "#111111",
                "editor.selectionBackground": "#26735533",
                "editorCursor.foreground": "#26A65B",
                "editorLineNumber.foreground": "#3A3A3A",
                "editorLineNumber.activeForeground": "#26A65B",
            },
        });
        monaco.editor.setTheme("neon-dark");

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

        provider.on('status', (event: any) => {
            setIsConnected(event.status === 'connected');
        });

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

        // Observe metadata changes and store cleanup function
        yMeta.observe(updateMetadata);
        yMetaObserverRef.current = () => yMeta.unobserve(updateMetadata);

        // Initialize language and metadata if not set
        if (!yMeta.get("language")) {
            yMeta.set("language", "javascript");
        } else {
            updateMetadata();
        }
    }

    const handleLanguageChange = (lang: string) => {
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
            yMetaObserverRef.current?.(); // Unobserve yMeta to prevent memory leak
            bindingRef.current?.destroy();
            providerRef.current?.destroy();
            ydocRef.current?.destroy();
        };
    }, []);

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden p-3 gap-3">
            {/* Top Bar */}
            <TopBar
                roomId={roomId}
                isConnected={isConnected}
                inCall={inCall}
                language={language}
                onJoinAudio={handleStartAudio}
                onCreateRoom={handleCreateRoom}
                onLanguageChange={handleLanguageChange}
            />

            {/* Problem Panel */}
            {metadata.title && (
                <ProblemPanel metadata={metadata} />
            )}

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden gap-3">
                {/* Left - Code Editor */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 min-w-0"
                >
                    <CodeEditor language={language} onMount={handleEditorDidMount} />
                </motion.div>

                {/* Right - AI Chat & Output */}
                <div className="w-[380px] flex flex-col gap-3 flex-shrink-0">
                    {/* AI Chat - Top */}
                    <div className="flex-1 min-h-0">
                        <AIChat />
                    </div>

                    {/* Output - Bottom */}
                    <div className="h-[280px] flex-shrink-0">
                        <OutputPanel />
                    </div>
                </div>
            </div>
        </div>
    );
}

