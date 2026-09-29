import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { editor } from "monaco-editor";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useStatus, useOthers, useUpdateMyPresence } from "@liveblocks/react/suspense";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { MonacoBinding } from "y-monaco";
import { CodeEditor } from "./editor/CodeEditor";
import { QuestionSidebar } from "./editor/QuestionSidebar";
import { TopBar } from "./editor/TopBar";
import { ProblemPanel } from "./editor/ProblemPanel";
import { AIChat } from "./editor/AIChat";
import { OutputPanel } from "./editor/OutputPanel";
import LiveCursors from "./editor/LiveCursors";
import { ConnectionToast } from "./editor/ConnectionToast";
import { BroadcastProvider } from "./editor/BroadcastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, MessageSquare, Terminal, Edit3, X } from "lucide-react";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { SettingsPanel } from "./editor/SettingsPanel";
import { Whiteboard } from "./editor/Whiteboard";
import { PerformanceMetricsCard } from "./editor/metrics/PerformanceMetricsCard";
import type { ExecutionMetric, PerformanceData } from "./editor/metrics/types";
import { authedFetch } from "../lib/apiClient";

import { VideoCall } from "./editor/neoVideoCall";

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

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

interface Metadata {
  title?: string;
  difficulty?: string;
  question?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  fullSolution?: string;
  starterCode?: string;
}

interface QuestionSlot {
  status: "pending" | "generating" | "ready" | "error";
  title?: string;
  difficulty?: string;
  question?: string;
  language?: string;
  hints?: string[];
  complexity?: { time: string; space: string };
  starterCode?: string;
  fullSolution?: string;
  version?: number;
}

const getQuestionTextName = (index: number) => `monaco-q${index}`;

type MobilePanel = "editor" | "chat" | "output" | "whiteboard";

/**
 * Inner component that uses the Liveblocks room.
 * Must be rendered inside a RoomProvider.
 */
function CollaborativeEditorInner({
  onRoomReady,
}: {
  onRoomReady?: () => void;
}) {
  const room = useRoom();
  const status = useStatus();
  const { zenMode, theme } = useTheme();
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const isDesktop = useIsDesktop();

  // LiveKit call state — SFU, not mesh P2P
  const [inCall, setInCall] = useState(false);
  const [callStatus, setCallStatus] = useState<{
    count: number;
    speakingName: string | null;
    muted: boolean;
  }>({ count: 1, speakingName: null, muted: false });
  const nickname = useMemo(() => getNickname(), []);
  const identity = useMemo(
    () => `${nickname}-${Math.random().toString(36).slice(2, 8)}`,
    [nickname],
  );

  const handleJoinCall = () => {
    setInCall(true);
    updateMyPresence({ isInCall: true } as never);
  };
  const handleLeaveCall = () => {
    setInCall(false);
    updateMyPresence({ isInCall: false } as never);
  };

  const providerRef = useRef<LiveblocksYjsProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const boundTextNameRef = useRef<string | null>(null);
  const yMetaObserverRef = useRef<(() => void) | null>(null);
  const yQuestionsObserverRef = useRef<(() => void) | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);
  const monacoRef = useRef<any>(null);
  const yOutputRef = useRef<Y.Array<any> | null>(null);
  const yExecRef = useRef<Y.Map<any> | null>(null);
  const yQuestionsRef = useRef<Y.Array<any> | null>(null);

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionSlot[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const switchTimeoutRef = useRef<number | null>(null);
  const activeQuestionIndexRef = useRef(0);
  const generateRemainingFiredRef = useRef(false);

  const inWhiteboard = others.filter(
    (o) => o.presence?.hoveredPanel === "whiteboard",
  );
  const inEditor = others.filter((o) => o.presence?.hoveredPanel === "editor");
  const getCollaboratorsInPanel = (panelId: string) => {
    return others.filter((o) => o.presence?.hoveredPanel === panelId);
  };
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeMainView, setActiveMainView] = useState<"code" | "whiteboard">(
    "code",
  );
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [, setMetricsHistoryState] = useState<ExecutionMetric[]>([]);
  const [perfData, setLocalPerfData] = useState<PerformanceData>({
    metrics: [],
    successRate: 0,
    comparison: { current: 0, previous: 0, improvementPercent: 0 },
    status: "stable",
  });
  const [isRunning, setIsRunning] = useState(false);

  // Wrappers to sync metrics history and performance data across all users via Y.js
  const setMetricsHistory = (
    value: ExecutionMetric[] | ((prev: ExecutionMetric[]) => ExecutionMetric[])
  ) => {
    if (!yExecRef.current) return;
    const currentStr = yExecRef.current.get("metricsHistory") as string | undefined;
    let currentList: ExecutionMetric[] = [];
    if (currentStr) {
      try {
        currentList = JSON.parse(currentStr);
      } catch {}
    }
    const newList = typeof value === "function" ? value(currentList) : value;
    yExecRef.current.set("metricsHistory", JSON.stringify(newList));
  };

  const setPerfData = (
    value: PerformanceData | ((prev: PerformanceData) => PerformanceData)
  ) => {
    if (!yExecRef.current) return;
    const currentStr = yExecRef.current.get("perfData") as string | undefined;
    let currentData: PerformanceData = {
      metrics: [],
      successRate: 0,
      comparison: { current: 0, previous: 0, improvementPercent: 0 },
      status: "stable",
    };
    if (currentStr) {
      try {
        currentData = JSON.parse(currentStr);
      } catch {}
    }
    const newData = typeof value === "function" ? value(currentData) : value;
    yExecRef.current.set("perfData", JSON.stringify(newData));
  };

  useEffect(() => {
    if (!yExecRef.current) return;
    const handleExecChange = () => {
      setIsRunning(!!yExecRef.current?.get("isRunning"));

      const sharedHistory = yExecRef.current?.get("metricsHistory") as string | undefined;
      if (sharedHistory) {
        try {
          setMetricsHistoryState(JSON.parse(sharedHistory));
        } catch {}
      } else {
        setMetricsHistoryState([]);
      }

      const sharedPerf = yExecRef.current?.get("perfData") as string | undefined;
      if (sharedPerf) {
        try {
          setLocalPerfData(JSON.parse(sharedPerf));
        } catch {}
      } else {
        setLocalPerfData({
          metrics: [],
          successRate: 0,
          comparison: { current: 0, previous: 0, improvementPercent: 0 },
          status: "stable",
        });
      }
    };
    yExecRef.current.observe(handleExecChange);
    handleExecChange();

    return () => {
      yExecRef.current?.unobserve(handleExecChange);
    };
  }, [yExecRef.current]);

  const hasCalledReadyRef = useRef(false);
  const cursorPanelRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState("javascript");
  const [metadata, setMetadata] = useState<Metadata>({});
  const [activePanel, setActivePanel] = useState<MobilePanel>("editor");

  const yDocRef = useRef<Y.Doc | null>(null);
  const [yWhiteboard, setYWhiteboard] = useState<Y.Text | null>(null);
  const [yChat, setYChat] = useState<Y.Array<any> | null>(null);

  const getCode = useCallback(() => {
    
    const yDoc = yDocRef.current;
    const hasMulti =
      (yQuestionsRef.current?.length ?? 0) > 0 ||
      (yDoc ? yDoc.getArray("questions").length > 0 : false);
    const textName = hasMulti
      ? getQuestionTextName(activeQuestionIndexRef.current)
      : "monaco";
    const fromYjs = yDoc?.getText(textName)?.toString();
    if (fromYjs?.trim()) return fromYjs;
    try {
      return editorRef.current?.getValue() ?? fromYjs ?? "";
    } catch {
      return fromYjs ?? "";
    }
  }, []);

  const roomId =
    new URLSearchParams(window.location.search).get("room") || "default";

  // Signal the parent (RouteTransition) that the room is live
  useEffect(() => {
    if (status === "connected" && !hasCalledReadyRef.current) {
      hasCalledReadyRef.current = true;
      onRoomReady?.();
    }
  }, [status, onRoomReady]);

    
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
    setYChat(yDoc.getArray("chat"));

    const yQuestions = yDoc.getArray("questions");
    yQuestionsRef.current = yQuestions as Y.Array<any>;
    const snapshotQuestions = () => {
      try {
        const arr = yQuestions.toArray() as unknown as QuestionSlot[];
        const plain = (yQuestions.toArray() as any[]).map((entry: any) =>
          typeof entry?.toJSON === "function" ? entry.toJSON() : entry,
        ) as QuestionSlot[];
        void arr;
        setQuestions(plain);
      } catch {
        setQuestions([]);
      }
    };
    const handleQuestionsChange = () => snapshotQuestions();
    yQuestions.observeDeep(handleQuestionsChange);
    yQuestionsObserverRef.current = () => yQuestions.unobserveDeep(handleQuestionsChange);

    // Metadata Sync via Y.Map (legacy single-question path + fallback)
    const yMeta = yDoc.getMap("meta");
    const updateMetadata = () => {
      if (yQuestionsRef.current && yQuestionsRef.current.length > 0) return;
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
    const handleSync = (synced: boolean) => {
      if (synced) {
        setIsSynced(true);
        snapshotQuestions();
        try {
          updateMyPresence({
            currentQuestionIndex: activeQuestionIndexRef.current,
          } as never);
        } catch {}
        const syncedLang = yMeta.get("language");
        if (!syncedLang) {
          if (yQuestions.length === 0) {
            yMeta.set("language", "javascript");
          }
        } else {
          updateMetadata();
        }
      }
    };
    yProvider.on("sync", handleSync);

    // Check immediately in case already synced (most likely yes)
    if (yProvider.synced) {
      handleSync(true);
    }

    return () => {
      yMetaObserverRef.current?.();
      yQuestionsObserverRef.current?.();
      try {
        (yProvider as any).off?.("sync", handleSync);
      } catch {}
      yProvider.destroy();
      yDoc.destroy();
      providerRef.current = null;
      yDocRef.current = null;
      yOutputRef.current = null;
      yExecRef.current = null;
      yQuestionsRef.current = null;
      setIsSynced(false);
    };
    
  }, [room, status]);

  const updateMetadataFromQuestions = useCallback(() => {
    const yDoc = yDocRef.current;
    if (!yDoc) return;
    const yArr = yQuestionsRef.current ?? yDoc.getArray("questions");
    if (!yArr || yArr.length === 0) return;
    const raw = (yArr.toArray() as any[])[activeQuestionIndexRef.current];
    if (!raw) return;
    const slot = (
      typeof raw?.toJSON === "function" ? raw.toJSON() : raw
    ) as QuestionSlot;
    if (slot.status !== "ready") return;
    if (slot.language) {
      setLanguage(slot.language);
      if (editorRef.current && monacoRef.current) {
        try {
          const model = editorRef.current.getModel();
          if (model)
            monacoRef.current.editor.setModelLanguage(model, slot.language);
        } catch {}
      }
    }
    setMetadata({
      title: slot.title,
      difficulty: slot.difficulty,
      question: slot.question,
      hints: slot.hints,
      complexity: slot.complexity,
      fullSolution: slot.fullSolution,
      starterCode: slot.starterCode,
    });
  }, []);

  useEffect(() => {
    updateMetadataFromQuestions();
  }, [questions, activeQuestionIndex, updateMetadataFromQuestions]);

    const bindModelToTextName = useCallback(
    (textName: string, seedStarterCode?: string) => {
      const yDoc = yDocRef.current;
      const yProvider = providerRef.current;
      const editorInstance = editorRef.current;
      if (!yDoc || !yProvider || !editorInstance) return;
      const yText = yDoc.getText(textName);
      const awareness = (yProvider as any).awareness;
      let model;
      try {
        model = editorInstance.getModel();
      } catch {
        return;
      }
      if (!model) return;

      try {
        bindingRef.current?.destroy();
      } catch {}
      bindingRef.current = null;

      if (yText.length === 0 && seedStarterCode) {
        try {
          yText.insert(0, seedStarterCode);
        } catch {}
      }

      try {
        model.setValue(yText.toString());
      } catch {}
      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editorInstance]),
        awareness as any,
      );
      boundTextNameRef.current = textName;
    },
    [],
  );

  const switchToQuestion = useCallback(
    (index: number) => {
      const yDoc = yDocRef.current;
      if (!yDoc) {
        setActiveQuestionIndex(index);
        activeQuestionIndexRef.current = index;
        return;
      }
      const yArr = yQuestionsRef.current ?? yDoc.getArray("questions");
      const hasMulti =
        (yArr?.length ?? 0) > 0 || yDoc.getText("monaco-q0").length > 0;
      const textName = hasMulti ? getQuestionTextName(index) : "monaco";

      if (boundTextNameRef.current === textName) {
        setActiveQuestionIndex(index);
        activeQuestionIndexRef.current = index;
        try {
          updateMyPresence({ currentQuestionIndex: index } as never);
        } catch {}
        return;
      }

      let seed: string | undefined;
      try {
        const raw = (yArr?.toArray() as any[])?.[index];
        const slot = (
          typeof raw?.toJSON === "function" ? raw.toJSON() : raw
        ) as QuestionSlot | undefined;
        if (slot?.status === "ready") seed = slot.starterCode;
        if (slot?.language) {
          setLanguage(slot.language);
          if (editorRef.current && monacoRef.current) {
            try {
              const m = editorRef.current.getModel();
              if (m)
                monacoRef.current.editor.setModelLanguage(m, slot.language);
            } catch {}
          }
        }
      } catch {}

      setActiveQuestionIndex(index);
      activeQuestionIndexRef.current = index;
      setIsSwitching(true);
      if (switchTimeoutRef.current !== null) {
        clearTimeout(switchTimeoutRef.current);
      }
      bindModelToTextName(textName, seed);
      switchTimeoutRef.current = window.setTimeout(() => {
        setIsSwitching(false);
        switchTimeoutRef.current = null;
      }, 200);
      try {
        updateMyPresence({ currentQuestionIndex: index } as never);
      } catch {}
    },
    [bindModelToTextName, updateMyPresence],
  );

  useEffect(() => {
    if (!isSynced || !editorRef.current) return;
    const expected =
      questions.length > 0
        ? getQuestionTextName(activeQuestionIndexRef.current)
        : "monaco";
    if (boundTextNameRef.current && boundTextNameRef.current !== expected) {
      switchToQuestion(activeQuestionIndexRef.current);
    }
    
  }, [isSynced, questions]);

  useEffect(() => {
    if (!isSynced || questions.length === 0) return;
    if (generateRemainingFiredRef.current) return;
    if (questions[1]?.status !== "pending") return;

    let ctx: { prompt: string; promptType: "problem" | "profile" } | null =
      null;
    try {
      const raw = sessionStorage.getItem(`ai-session-${roomId}`);
      if (raw) ctx = JSON.parse(raw);
    } catch {}
    if (!ctx?.prompt) return;

    try {
      if (yExecRef.current?.get("queueStarted")) return;
      yExecRef.current?.set("queueStarted", true);
    } catch {}
    generateRemainingFiredRef.current = true;

    const generatedTitles = questions[0]?.title
      ? [questions[0].title as string]
      : [];
    authedFetch(`/api/ai/session/generate-remaining`, roomId, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        prompt: ctx.prompt,
        promptType: ctx.promptType ?? "problem",
        generatedTitles,
      }),
    }).catch((err) => {
      console.warn("generate-remaining trigger failed:", err);
      generateRemainingFiredRef.current = false;
    });
  }, [isSynced, questions, roomId]);

  const presenceByQuestion = useMemo(() => {
    const map = new Map<number, { name: string; color: string }[]>();
    for (const o of others) {
      const idx = o.presence?.currentQuestionIndex;
      if (typeof idx !== "number") continue;
      const entry = map.get(idx) ?? [];
      entry.push({
        name: o.presence?.info?.name ?? "Anonymous",
        color: o.presence?.info?.color ?? "var(--color-primary)",
      });
      map.set(idx, entry);
    }
    return map;
  }, [others]);

  const handleRetryQuestion = useCallback(
    (index: number) => {
      let ctx: { prompt: string; promptType: "problem" | "profile" } | null =
        null;
      try {
        const raw = sessionStorage.getItem(`ai-session-${roomId}`);
        if (raw) ctx = JSON.parse(raw);
      } catch {}
      if (!ctx?.prompt) {
        console.warn("question retry skipped: no prompt context for room");
        return;
      }
      const generatedTitles = questions
        .filter((q) => q.status === "ready" && q.title)
        .map((q) => q.title as string);
      authedFetch(`/api/ai/session/generate-remaining`, roomId, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          prompt: ctx.prompt,
          promptType: ctx.promptType ?? "problem",
          generatedTitles,
          startFromIndex: index,
        }),
      }).catch((err) => {
        console.warn("question retry failed:", err);
      });
    },
    [questions, roomId],
  );

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
    const monacoTheme =
      theme === "light"
        ? "vs"
        : theme === "contrast"
          ? "hc-black"
          : "neon-dark";
    monaco.editor.setTheme(monacoTheme);

    const yDoc = yDocRef.current;
    const yProvider = providerRef.current;
    if (!yDoc || !yProvider) return;

    const yArr = yDoc.getArray("questions");
    const hasMulti =
      yArr.length > 0 || yDoc.getText("monaco-q0").length > 0;
    const initialTextName = hasMulti
      ? getQuestionTextName(activeQuestionIndexRef.current)
      : "monaco";
    const yText = yDoc.getText(initialTextName);
    const awareness = yProvider.awareness;

    // Set local user state for awareness
    awareness.setLocalStateField("user", {
      name: getNickname(),
      color: randomColor(),
    });

    const model = editorInstance.getModel();
    if (model) {
      try {
        bindingRef.current?.destroy();
      } catch {}
      bindingRef.current = null;

      const existingYjsContent = yText.toString();
      if (existingYjsContent.length > 0) {
        // Existing room — clear defaultValue so MonacoBinding
        // populates the editor from yText (source of truth)
        try {
          model.setValue("");
        } catch {}
      }

      bindingRef.current = new MonacoBinding(
        yText,
        model,
        new Set([editorInstance]),
        awareness as any,
      );
      boundTextNameRef.current = initialTextName;

      try {
        updateMyPresence({
          currentQuestionIndex: activeQuestionIndexRef.current,
        } as never);
      } catch {}

      // For a NEW room, yText is empty after binding.
      // Populate it with starter code (from API metadata) or a default.
      if (yText.toString().length === 0) {
        if (hasMulti) {
          try {
            const raw = (yArr.toArray() as any[])?.[
              activeQuestionIndexRef.current
            ];
            const slot = (
              typeof raw?.toJSON === "function" ? raw.toJSON() : raw
            ) as QuestionSlot | undefined;
            if (slot?.starterCode) yText.insert(0, slot.starterCode);
          } catch {}
          if (yText.length === 0) {
            const yMeta = yDoc.getMap("meta");
            const starterCode = yMeta.get("starterCode") as string | undefined;
            if (starterCode) yText.insert(0, starterCode);
          }
        } else {
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

  useEffect(() => {
    return () => {
      bindingRef.current?.destroy();
      if (switchTimeoutRef.current !== null) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }
    };
  }, []);

  const handleEditorUnmount = useCallback(() => {
    try {
      bindingRef.current?.destroy();
    } catch {}
    bindingRef.current = null;
    boundTextNameRef.current = null;
    if (switchTimeoutRef.current !== null) {
      clearTimeout(switchTimeoutRef.current);
      switchTimeoutRef.current = null;
    }
    setIsSwitching(false);
    editorRef.current = null;
    monacoRef.current = null;
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
    <div
      ref={mainContainerRef}
      className='h-screen flex flex-col bg-background overflow-hidden p-0 gap-1.5 sm:gap-2 lg:gap-3 relative'
    >
      {/* Connection Toast — global position: fixed overlay */}
      <ConnectionToast />

      {/* BroadcastProvider wraps everything to enable event listening */}
      <BroadcastProvider>
        <LiveCursors cursorPanel={mainContainerRef} />
        {/* Top Bar — now uses useStatus internally instead of isConnected prop */}
        <TopBar
          roomId={roomId}
          inCall={inCall}
          callCount={callStatus.count}
          speakingName={callStatus.speakingName}
          callMuted={callStatus.muted}
          language={language}
          onJoinAudio={handleJoinCall}
          onLeaveAudio={handleLeaveCall}
          onLanguageChange={handleLanguageChange}
          onOpenSettings={() => setIsSettingsOpen(true)}
          activeMainView={activeMainView}
          onActiveMainViewChange={setActiveMainView}
          collaboratorsInEditor={inEditor}
          collaboratorsInWhiteboard={inWhiteboard}
        />

        {inCall && (
          <VideoCall
            roomId={roomId}
            identity={identity}
            name={nickname}
            onLeave={handleLeaveCall}
            onStatus={setCallStatus}
          />
        )}

        {/* Problem Panel (Desktop & Mobile Panel Overlay) */}
        {((questions.length > 0) || metadata.title) && !zenMode && (
          <ProblemPanel metadata={metadata} language={language}>
            {questions.length > 0 ? (
              <QuestionSidebar
                questions={questions}
                activeIndex={activeQuestionIndex}
                onSelect={switchToQuestion}
                presenceByQuestion={presenceByQuestion}
                onRetry={handleRetryQuestion}
              />
            ) : undefined}
          </ProblemPanel>
        )}

        {/* Mobile/Tablet Tab Bar */}
        {!isDesktop && (
        <div className='flex items-center gap-1 glass-panel rounded-lg p-1'>
          {mobileTabs.map((tab) => {
            const panelCollaborators = getCollaboratorsInPanel(tab.id);
            const showBadge =
              panelCollaborators.length > 0 && activePanel !== tab.id;
            const badgeColor =
              panelCollaborators[0]?.presence?.info?.color ||
              "var(--color-primary)";

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
                    className='absolute top-1 right-2 w-2 h-2 rounded-full animate-pulse border border-background shadow-sm'
                  />
                )}
                {tab.icon}
                <span className='hidden sm:inline'>{tab.label}</span>
              </button>
            );
          })}
        </div>
        )}

        {/* Main Content */}
        <div
          ref={cursorPanelRef}
          className='flex-1 flex overflow-hidden gap-1.5 sm:gap-2 lg:gap-3 relative'
        >
          {isDesktop ? (
          <>

          {/* Left - Code Editor / Whiteboard */}
          <motion.div
            id='workspace-panel'
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col flex-1 min-w-0'
          >
            {/* Double-Bezel Workspace Shell */}
            <div className='flex-1 w-full h-full min-h-0 relative p-1.5 bg-glass-border/10 border border-glass-border/40 rounded-3xl shadow-xl backdrop-blur-sm'>
              <div className='w-full h-full bg-card rounded-[calc(1.5rem-6px)] overflow-hidden border border-glass-border/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] relative'>
                {/* Monaco Code Editor Wrapper */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    activeMainView === "code" && !isSwitching
                      ? "opacity-100 pointer-events-auto z-10"
                      : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  <CodeEditor
                    onMount={handleEditorDidMount}
                    onUnmount={handleEditorUnmount}
                    language={language}
                  />
                </div>

                {/* Excalidraw Whiteboard Wrapper */}
                <div
                  className={`absolute inset-0 transition-opacity duration-200 ${
                    activeMainView === "whiteboard"
                      ? "opacity-100 pointer-events-auto z-10"
                      : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  <Whiteboard yWhiteboard={yWhiteboard} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - AI Chat & Output */}
          {!zenMode && (
          <div
            className='flex w-[380px] xl:w-[420px] flex-col gap-3 flex-shrink-0 transition-all duration-300'
          >
            {/* AI Chat - Top */}
            <div className='flex-1 min-h-0'>
              <AIChat editorRef={editorRef} yChat={yChat} getFullCode={getCode} />
            </div>

            {/* Output - Bottom */}
            <div className='h-[240px] xl:h-[280px] flex-shrink-0'>
              <OutputPanel
                editorRef={editorRef}
                getCode={getCode}
                language={language}
                yOutput={yOutputRef.current}
                yExec={yExecRef.current}
                onOpenMetrics={() => setIsMetricsOpen(true)}
                setMetricsHistory={setMetricsHistory}
                setPerfData={setPerfData}
              />
            </div>
          </div>
          )}
          </>
          ) : (
          <div className='flex-1 min-w-0 min-h-0'>
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
                  <div
                    className={`h-full transition-opacity duration-200 ${isSwitching ? "opacity-0" : "opacity-100"}`}
                  >
                    <CodeEditor
                      onMount={handleEditorDidMount}
                      onUnmount={handleEditorUnmount}
                      language={language}
                    />
                  </div>
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
                  <AIChat editorRef={editorRef} yChat={yChat} getFullCode={getCode} />
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
                    getCode={getCode}
                    language={language}
                    yOutput={yOutputRef.current}
                    yExec={yExecRef.current}
                    onOpenMetrics={() => setIsMetricsOpen(true)}
                    setMetricsHistory={setMetricsHistory}
                    setPerfData={setPerfData}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          )}
        </div>

        {/* Floating Settings Panel */}
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onFormat={() => {
            if (editorRef.current) {
              editorRef.current
                .getAction("editor.action.formatDocument")
                ?.run();
            }
          }}
        />

        {/* Performance Metrics Modal Overlay */}
        <AnimatePresence>
          {isMetricsOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMetricsOpen(false)}
                className='fixed inset-0 bg-black/40 backdrop-blur-sm z-[99]'
              />

              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className='fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4 sm:px-0 z-[100]'
              >
                <div className='relative'>
                  {/* Close Button */}
                  <button
                    onClick={() => setIsMetricsOpen(false)}
                    className='absolute -top-3 -right-3 z-10 p-1.5 bg-secondary text-muted-foreground hover:text-foreground rounded-full border border-border shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer'
                    aria-label='Close metrics'
                  >
                    <X className='w-4 h-4' />
                  </button>
                  <PerformanceMetricsCard data={perfData} loading={isRunning} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
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
    <div className='h-screen w-screen flex items-center justify-center bg-background'>
      <div className='flex flex-col items-center gap-4 max-w-md text-center p-6'>
        <div className='w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center'>
          <span className='text-red-400 text-xl'>⚠</span>
        </div>
        <h2 className='text-foreground text-lg font-semibold'>Room Error</h2>
        <p className='text-muted-foreground text-sm'>
          {error instanceof Error ? error.message : String(error)}
        </p>
        <button
          onClick={resetErrorBoundary}
          className='px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 
                     hover:bg-primary/30 transition-colors text-sm font-medium cursor-pointer'
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
export default function CollaborativeEditor({
  onRoomReady,
}: {
  onRoomReady?: () => void;
}) {
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
            currentQuestionIndex: 0,
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
