import { useEffect, useRef, useState } from "react";
import { editor } from "monaco-editor";
import { useNavigate } from "react-router-dom";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom } from "@liveblocks/react/suspense";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { MonacoBinding } from "y-monaco";
import { CodeEditor } from "./editor/CodeEditor";
import { TopBar } from "./editor/TopBar";
import { ProblemPanel } from "./editor/ProblemPanel";
import { AIChat } from "./editor/AIChat";
import { OutputPanel } from "./editor/OutputPanel";
import LiveCursors from "./editor/LiveCursors";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, MessageSquare, Terminal } from "lucide-react";

const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

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

type MobilePanel = "editor" | "chat" | "output";

/**
 * Inner component that uses the Liveblocks room.
 * Must be rendered inside a RoomProvider.
 */
function CollaborativeEditorInner() {
  const navigate = useNavigate();
  const room = useRoom();
  const providerRef = useRef<LiveblocksYjsProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const yMetaObserverRef = useRef<(() => void) | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<any>(null);
  const yOutputRef = useRef<Y.Array<any> | null>(null);
  const yExecRef = useRef<Y.Map<any> | null>(null);
  const cursorPanelRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("javascript");
  const [isConnected, setIsConnected] = useState(false);
  const [metadata, setMetadata] = useState<Metadata>({});
  const [activePanel, setActivePanel] = useState<MobilePanel>("editor");

  const roomId =
    new URLSearchParams(window.location.search).get("room") || "default";

  function handleEditorDidMount(editorInstance: any, monaco: any) {
    console.log("Editor mounted!");
    editorRef.current = editorInstance;
    monacoRef.current = monaco;

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

    // Create the Liveblocks Yjs provider
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    providerRef.current = yProvider;

    // Shared output and execution lock for all collaborators
    yOutputRef.current = yDoc.getArray("output");
    yExecRef.current = yDoc.getMap("execution");

    // Track connection status
    setIsConnected(true);

    const yText = yDoc.getText("monaco");
    const awareness = yProvider.awareness;

    // Set local user state for awareness
    awareness.setLocalStateField("user", {
      name: username,
      color: randomColor(),
    });

    const model = editorInstance.getModel();
    if (model) {
      const existingYjsContent = yText.toString();
      if (existingYjsContent.length > 0) {
        model.setValue("");
      }
      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editorInstance]),
        awareness as any,
      );
    }

    // Metadata Sync via Y.Map
    const yMeta = yDoc.getMap("meta");

    const updateMetadata = () => {
      const lang = yMeta.get("language") as string;
      if (lang) {
        setLanguage(lang);
        const model = editorInstance.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, lang);
        }
      }

      setMetadata({
        title: yMeta.get("title") as string | undefined,
        difficulty: yMeta.get("difficulty") as string | undefined,
        question: yMeta.get("question") as string | undefined,
        hints: yMeta.get("hints")
          ? JSON.parse(yMeta.get("hints") as string)
          : undefined,
        complexity: yMeta.get("complexity")
          ? JSON.parse(yMeta.get("complexity") as string)
          : undefined,
        fullSolution: yMeta.get("fullSolution") as string | undefined,
        starterCode: yMeta.get("starterCode") as string | undefined,
      });
    };

    yMeta.observe(updateMetadata);
    yMetaObserverRef.current = () => yMeta.unobserve(updateMetadata);

    // Handle metadata defaults on sync
    yProvider.on("sync", (synced: boolean) => {
      if (synced) {
        setIsConnected(true);
        const syncedLang = yMeta.get("language");
        if (!syncedLang) {
          yMeta.set("language", "javascript");
        } else {
          updateMetadata();
        }
      }
    });

    // Check immediately in case already synced (most likely yes)
    if (yProvider.synced) {
      const syncedLang = yMeta.get("language");
      if (!syncedLang) {
        yMeta.set("language", "javascript");
      } else {
        updateMetadata();
      }
    }
  }

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);

    // Update Monaco model language directly
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, lang);
      }
    }

    // Sync to Y.js via Liveblocks
    if (providerRef.current) {
      const yDoc = providerRef.current.getYDoc();
      const yMeta = yDoc.getMap("meta");
      yMeta.set("language", lang);
    }
  };

  const handleCreateRoom = () => {
    const id = crypto.randomUUID().slice(0, 8);
    navigate(`/editor?room=${id}`);
  };

  useEffect(() => {
    return () => {
      yMetaObserverRef.current?.(); // Unobserve yMeta to prevent memory leak
      bindingRef.current?.destroy();
      providerRef.current?.destroy();
    };
  }, []);

  const mobileTabs: {
    id: MobilePanel;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "editor", label: "Code", icon: <Code2 className='w-4 h-4' /> },
    {
      id: "chat",
      label: "AI Chat",
      icon: <MessageSquare className='w-4 h-4' />,
    },
    { id: "output", label: "Output", icon: <Terminal className='w-4 h-4' /> },
  ];

  return (
    <div className='h-screen flex flex-col bg-background overflow-hidden p-1.5 sm:p-2 lg:p-3 gap-1.5 sm:gap-2 lg:gap-3'>
      {/* Top Bar */}
      <TopBar
        roomId={roomId}
        isConnected={isConnected}
        inCall={false}
        language={language}
        onJoinAudio={() => {}}
        onCreateRoom={handleCreateRoom}
        onLanguageChange={handleLanguageChange}
      />

      {/* Problem Panel */}
      {metadata.title && (
        <ProblemPanel metadata={metadata} language={language} />
      )}

      {/* Mobile/Tablet Tab Bar — visible below lg */}
      <div className='lg:hidden flex items-center gap-1 glass-panel rounded-lg p-1'>
        {mobileTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
              activePanel === tab.id
                ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(0,255,65,0.15)]"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            {tab.icon}
            <span className='hidden sm:inline'>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content — Desktop: side-by-side, Mobile/Tablet: tabbed panels */}
      <div
        ref={cursorPanelRef}
        className='flex-1 flex overflow-hidden gap-1.5 sm:gap-2 lg:gap-3 relative'
      >
        {/* Live Cursors */}
        <LiveCursors cursorPanel={cursorPanelRef} />

        {/* ─── Desktop Layout (lg+) ─── */}
        {/* Left - Code Editor (desktop only, always visible) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className='hidden lg:flex flex-1 min-w-0'
        >
          <div className='w-full h-full'>
            <CodeEditor onMount={handleEditorDidMount} />
          </div>
        </motion.div>

        {/* Right - AI Chat & Output (desktop only) */}
        <div className='hidden lg:flex w-[380px] xl:w-[420px] flex-col gap-3 flex-shrink-0'>
          {/* AI Chat - Top */}
          <div className='flex-1 min-h-0'>
            <AIChat editorRef={editorRef} />
          </div>

          {/* Output - Bottom */}
          <div className='h-[240px] xl:h-[280px] flex-shrink-0'>
            <OutputPanel
              editorRef={editorRef}
              language={language}
              yOutput={yOutputRef.current}
              yExec={yExecRef.current}
            />
          </div>
        </div>

        {/* ─── Mobile/Tablet Layout (<lg) ─── */}
        <div className='lg:hidden flex-1 min-w-0 min-h-0'>
          <AnimatePresence mode='wait'>
            {activePanel === "editor" && (
              <motion.div
                key='editor-panel'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                className='h-full'
              >
                <CodeEditor onMount={handleEditorDidMount} />
              </motion.div>
            )}
            {activePanel === "chat" && (
              <motion.div
                key='chat-panel'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                className='h-full'
              >
                <AIChat editorRef={editorRef} />
              </motion.div>
            )}
            {activePanel === "output" && (
              <motion.div
                key='output-panel'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                className='h-full'
              >
                <OutputPanel
                  editorRef={editorRef}
                  language={language}
                  yOutput={yOutputRef.current}
                  yExec={yExecRef.current}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * Outer wrapper that extracts roomId from URL and provides the RoomProvider.
 * This is the default export used by App.tsx.
 */
export default function CollaborativeEditor() {
  const roomId =
    new URLSearchParams(window.location.search).get("room") || "default";

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
      <ClientSideSuspense
        fallback={
          <div className='h-screen w-screen flex items-center justify-center bg-background'>
            <div className='flex flex-col items-center gap-4'>
              <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
              <span className='text-muted-foreground text-sm'>
                Connecting to room...
              </span>
            </div>
          </div>
        }
      >
        <CollaborativeEditorInner />
      </ClientSideSuspense>
    </RoomProvider>
  );
}
