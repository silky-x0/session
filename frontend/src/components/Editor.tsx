import { useEffect, useRef, useState } from "react";
import { editor } from "monaco-editor";
import { useNavigate } from "react-router-dom";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useStatus, useOthers } from "@liveblocks/react/suspense";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { MonacoBinding } from "y-monaco";
import { CodeEditor } from "./editor/CodeEditor";
import { TopBar } from "./editor/TopBar";
import { ProblemPanel } from "./editor/ProblemPanel";
import { AIChat } from "./editor/AIChat";
import { OutputPanel } from "./editor/OutputPanel";
import LiveCursors from "./editor/LiveCursors";
import { ConnectionToast } from "./editor/ConnectionToast";
import { BroadcastProvider } from "./editor/BroadcastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, MessageSquare, Terminal, Edit3 } from "lucide-react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { SettingsPanel } from "./editor/SettingsPanel";
import { Whiteboard } from "./editor/Whiteboard";



const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

const getNickname = () => {
  const params = new URLSearchParams(window.location.search);
  const nickname = params.get("nickname");
  return nickname ? decodeURIComponent(nickname) : "Anonymous";
};

interface Metadata {
  title?: string;
  difficulty?: string;
  question?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  fullSolution?: string;
  starterCode?: string;
}

type MobilePanel = "editor" | "chat" | "output" | "whiteboard";


/**
 * Inner component that uses the Liveblocks room.
 * Must be rendered inside a RoomProvider.
 */
function CollaborativeEditorInner({ onRoomReady }: { onRoomReady?: () => void }) {
  const navigate = useNavigate();
  const room = useRoom();
  const status = useStatus();
  const { zenMode, theme } = useTheme();
  const others = useOthers();

  const inWhiteboard = others.filter(o => o.presence?.hoveredPanel === "whiteboard");
  const inEditor = others.filter(o => o.presence?.hoveredPanel === "editor");
  const getCollaboratorsInPanel = (panelId: string) => {
    return others.filter(o => o.presence?.hoveredPanel === panelId);
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMainView, setActiveMainView] = useState<"code" | "whiteboard">("code");

  const hasCalledReadyRef = useRef(false);
  const providerRef = useRef<LiveblocksYjsProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const yMetaObserverRef = useRef<(() => void) | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<any>(null);
  const yOutputRef = useRef<Y.Array<any> | null>(null);
  const yExecRef = useRef<Y.Map<any> | null>(null);
  const cursorPanelRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("javascript");
  const [metadata, setMetadata] = useState<Metadata>({});
  const [activePanel, setActivePanel] = useState<MobilePanel>("editor");

  const yDocRef = useRef<Y.Doc | null>(null);
  const [yWhiteboard, setYWhiteboard] = useState<Y.Text | null>(null);


  const roomId =
    new URLSearchParams(window.location.search).get("room") || "default";

  // Signal the parent (RouteTransition) that the room is live
  useEffect(() => {
    if (status === "connected" && !hasCalledReadyRef.current) {
      hasCalledReadyRef.current = true;
      onRoomReady?.();
    }
  }, [status, onRoomReady]);

  // Shared Y.js document and Liveblocks synchronization provider setup
  useEffect(() => {
    if (status !== "connected") return;

    // Create the Liveblocks Yjs provider
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room as any, yDoc);
    providerRef.current = yProvider;
    yDocRef.current = yDoc;

    // Shared output and execution lock for all collaborators
    yOutputRef.current = yDoc.getArray("output");
    yExecRef.current = yDoc.getMap("execution");

    const yWhiteboardText = yDoc.getText("whiteboard");
    setYWhiteboard(yWhiteboardText);

    // Metadata Sync via Y.Map
    const yMeta = yDoc.getMap("meta");
    const updateMetadata = () => {
      const lang = yMeta.get("language") as string;
      if (lang) {
        setLanguage(lang);
        if (editorRef.current && monacoRef.current) {
          const model = editorRef.current.getModel();
          if (model) {
            monacoRef.current.editor.setModelLanguage(model, lang);
          }
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

    return () => {
      yMetaObserverRef.current?.();
      yProvider.destroy();
      yDoc.destroy();
      providerRef.current = null;
      yDocRef.current = null;
      yOutputRef.current = null;
      yExecRef.current = null;
    };
  }, [room, status]);

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
    const monacoTheme = theme === "light" ? "vs" : theme === "contrast" ? "hc-black" : "neon-dark";
    monaco.editor.setTheme(monacoTheme);

    const yDoc = yDocRef.current;
    const yProvider = providerRef.current;
    if (!yDoc || !yProvider) return;

    const yText = yDoc.getText("monaco");
    const awareness = yProvider.awareness;

    // Set local user state for awareness
    awareness.setLocalStateField("user", {
      name: getNickname(),
      color: randomColor(),
    });

    const model = editorInstance.getModel();
    if (model) {
      const existingYjsContent = yText.toString();
      if (existingYjsContent.length > 0) {
        // Existing room — clear defaultValue so MonacoBinding
        // populates the editor from yText (source of truth)
        model.setValue("");
      }
      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editorInstance]),
        awareness as any,
      );

      // For a NEW room, yText is empty after binding.
      // Populate it with starter code (from API metadata) or a default.
      if (yText.toString().length === 0) {
        const yMeta = yDoc.getMap("meta");
        const starterCode = yMeta.get("starterCode") as string | undefined;
        if (starterCode) {
          yText.insert(0, starterCode);
        } else {
          yText.insert(0, ``);
        }
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
      bindingRef.current?.destroy();
    };
  }, []);

  const mobileTabs: {
    id: MobilePanel;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: "editor", label: "Code", icon: <Code2 className='w-4 h-4' /> },
    { id: "whiteboard", label: "Board", icon: <Edit3 className='w-4 h-4' /> },
    {
      id: "chat",
      label: "AI Chat",
      icon: <MessageSquare className='w-4 h-4' />,
    },
    { id: "output", label: "Output", icon: <Terminal className='w-4 h-4' /> },
  ];


  return (
    <div ref={mainContainerRef} className='h-screen flex flex-col bg-background overflow-hidden p-0 gap-1.5 sm:gap-2 lg:gap-3 relative'>
      {/* Connection Toast — global position: fixed overlay */}
      <ConnectionToast />

      {/* BroadcastProvider wraps everything to enable event listening */}
      <BroadcastProvider>
        <LiveCursors cursorPanel={mainContainerRef} />
        {/* Top Bar — now uses useStatus internally instead of isConnected prop */}
        <TopBar
          roomId={roomId}
          inCall={false}
          language={language}
          onJoinAudio={() => {}}
          onCreateRoom={handleCreateRoom}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeMainView={activeMainView}
          onActiveMainViewChange={setActiveMainView}
          collaboratorsInEditor={inEditor}
          collaboratorsInWhiteboard={inWhiteboard}
        />

        {/* Problem Panel */}
        {metadata.title && !zenMode && (
          <ProblemPanel metadata={metadata} language={language} />
        )}

        {/* Mobile/Tablet Tab Bar — visible below lg */}
        <div className='lg:hidden flex items-center gap-1 glass-panel rounded-lg p-1'>
          {mobileTabs.map((tab) => {
            const panelCollaborators = getCollaboratorsInPanel(tab.id);
            const showBadge = panelCollaborators.length > 0 && activePanel !== tab.id;
            const badgeColor = panelCollaborators[0]?.presence?.info?.color || "var(--color-primary)";

            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                  activePanel === tab.id
                    ? "bg-foreground/10 text-foreground border border-foreground/20 shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                {showBadge && (
                  <span
                    style={{ backgroundColor: badgeColor }}
                    className="absolute top-1 right-2 w-2 h-2 rounded-full animate-pulse border border-background shadow-sm"
                  />
                )}
                {tab.icon}
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content — Desktop: side-by-side, Mobile/Tablet: tabbed panels */}
        <div
          ref={cursorPanelRef}
          className='flex-1 flex overflow-hidden gap-1.5 sm:gap-2 lg:gap-3 relative'
        >

          {/* ─── Desktop Layout (lg+) ─── */}
          {/* Left - Code Editor / Whiteboard (desktop only) */}
          <motion.div
            id="workspace-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='hidden lg:flex flex-col flex-1 min-w-0'
          >

            {/* Double-Bezel Workspace Shell */}
            <div className="flex-1 w-full h-full min-h-0 relative p-1.5 bg-glass-border/10 border border-glass-border/40 rounded-3xl shadow-xl backdrop-blur-sm">
              <div className="w-full h-full bg-card rounded-[calc(1.5rem-6px)] overflow-hidden border border-glass-border/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] relative">
                
                {/* Monaco Code Editor Wrapper */}
                <div className={`absolute inset-0 transition-opacity duration-200 ${
                  activeMainView === "code"
                    ? "opacity-100 pointer-events-auto z-10"
                    : "opacity-0 pointer-events-none z-0"
                }`}>
                  <CodeEditor onMount={handleEditorDidMount} />
                </div>

                {/* Excalidraw Whiteboard Wrapper */}
                <div className={`absolute inset-0 transition-opacity duration-200 ${
                  activeMainView === "whiteboard"
                    ? "opacity-100 pointer-events-auto z-10"
                    : "opacity-0 pointer-events-none z-0"
                }`}>
                  <Whiteboard yWhiteboard={yWhiteboard} />
                </div>

              </div>
            </div>
          </motion.div>

          {/* Right - AI Chat & Output (desktop only) */}
          <div className={`hidden lg:flex w-[380px] xl:w-[420px] flex-col gap-3 flex-shrink-0 transition-all duration-300 ${zenMode ? "lg:hidden" : ""}`}>
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
              {activePanel === "whiteboard" && (
                <motion.div
                  key='whiteboard-panel'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                  className='h-full'
                >
                  <Whiteboard yWhiteboard={yWhiteboard} />
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

        {/* Floating Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onFormat={() => {
            if (editorRef.current) {
              editorRef.current.getAction("editor.action.formatDocument")?.run();
            }
          }}
        />
      </BroadcastProvider>
    </div>
  );
}

/**
 * Error fallback for within the room context
 */
function RoomErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-red-400 text-xl">⚠</span>
        </div>
        <h2 className="text-foreground text-lg font-semibold">Room Error</h2>
        <p className="text-muted-foreground text-sm">{error instanceof Error ? error.message : String(error)}</p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 
                     hover:bg-primary/30 transition-colors text-sm font-medium cursor-pointer"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
}

/**
 * Outer wrapper that extracts roomId from URL and provides the RoomProvider.
 * This is the default export used by App.tsx.
 */
export default function CollaborativeEditor({ onRoomReady }: { onRoomReady?: () => void }) {
  const roomId =
    new URLSearchParams(window.location.search).get("room") || "default";

  // Provide the nickname in initial presence so other Liveblocks hooks (AvatarStack, LiveCursors) can access it
  const nickname = getNickname();
  const color = randomColor();
  // Include a random integer 1-100 in the seed for variety as requested
  const avatarSeed = `${nickname}-${Math.floor(Math.random() * 100) + 1}`;

  return (
    <ThemeProvider>
      <ErrorBoundary FallbackComponent={RoomErrorFallback}>
        <RoomProvider
          id={roomId}
          initialPresence={{
            cursor: null,
            isTyping: false,
            selectedLineNumber: null,
            hoveredPanel: null,
            info: {
              name: nickname,
              color: color,
              avatarSeed: avatarSeed,
            },
          }}
        >
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
            <CollaborativeEditorInner onRoomReady={onRoomReady} />
          </ClientSideSuspense>
        </RoomProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );

}
