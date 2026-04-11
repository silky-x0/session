import { motion } from "framer-motion";
import {
  Phone,
  PhoneCall,
  Plus,
  Undo2,
  Redo2,
  Zap,
} from "lucide-react";
import { useStatus, useUndo, useRedo, useCanUndo, useCanRedo } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";
import { AvatarStack } from "./AvatarStack";
import { SyncStatusBadge } from "./SyncStatusBadge";
import { NotificationBell } from "./NotificationsPanel";
import { useSendReaction } from "./BroadcastProvider";

interface TopBarProps {
  roomId: string;
  inCall: boolean;
  language: string;
  onJoinAudio: () => void;
  onCreateRoom: () => void;
  onLanguageChange: (lang: string) => void;
}

const LANGUAGES = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "go",
  "rust",
  "html",
  "css",
  "json",
];

const REACTION_EMOJIS = ["🔥", "👍", "🎉", "💡", "👀"];

/**
 * Top bar with room info, connection status (useStatus), avatar stack,
 * sync status badge, undo/redo, broadcast reactions, and notifications.
 */
export function TopBar({
  roomId,
  inCall,
  language,
  onJoinAudio,
  onCreateRoom,
  onLanguageChange,
}: TopBarProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="min-h-[3rem] sm:min-h-[3.5rem] glass-panel border-b border-border flex flex-wrap items-center justify-between px-2 sm:px-4 py-1.5 sm:py-0 z-10 rounded-lg gap-2"
    >
      {/* Left section - Room Info */}
      <div className="flex items-center gap-2 sm:gap-4">
        <motion.div
          className="flex items-center gap-1.5 sm:gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <span className="hidden sm:inline text-sm font-medium text-muted-foreground">
            Room:
          </span>
          <code className="font-mono text-primary text-xs sm:text-sm bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded max-w-[80px] sm:max-w-none truncate">
            {roomId}
          </code>
        </motion.div>

        {/* Connection status via useStatus */}
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <ConnectionStatusIndicator />
          </ClientSideSuspense>
        </ErrorBoundary>

        {/* Avatar Stack */}
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <AvatarStack />
          </ClientSideSuspense>
        </ErrorBoundary>
      </div>

      {/* Center section — Sync + Undo/Redo */}
      <div className="hidden md:flex items-center gap-2">
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <SyncStatusBadge />
          </ClientSideSuspense>
        </ErrorBoundary>

        <div className="w-px h-5 bg-border" />

        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <UndoRedoButtons />
          </ClientSideSuspense>
        </ErrorBoundary>

        <div className="w-px h-5 bg-border" />

        {/* Quick reactions (broadcast) */}
        <ErrorBoundary fallback={null}>
          <ClientSideSuspense fallback={null}>
            <ReactionButtons />
          </ClientSideSuspense>
        </ErrorBoundary>
      </div>

      {/* Right section - Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Notifications */}
        <NotificationBell />

        {!inCall ? (
          <motion.button
            onClick={onJoinAudio}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
          >
            <Phone className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Join Audio</span>
          </motion.button>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-primary text-xs sm:text-sm"
          >
            <PhoneCall className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="hidden sm:inline">Audio Active</span>
          </motion.div>
        )}

        <motion.button
          onClick={onCreateRoom}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors text-xs sm:text-sm font-medium border border-border cursor-pointer"
        >
          <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          <span className="hidden sm:inline">New Room</span>
        </motion.button>

        <motion.select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          whileHover={{ scale: 1.02 }}
          className="px-1.5 sm:px-3 py-1.5 rounded-lg bg-secondary text-foreground border border-border text-xs sm:text-sm font-mono cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-card">
              {lang}
            </option>
          ))}
        </motion.select>
      </div>
    </motion.div>
  );
}

/**
 * Real-time connection status using useStatus hook.
 * Replaces the manual isConnected boolean prop.
 * 
 * Statuses: initial → connecting → connected → reconnecting → disconnected
 */
function ConnectionStatusIndicator() {
  const status = useStatus();

  const statusConfig = {
    initial: { color: "text-muted-foreground", label: "Initializing…", dot: "bg-gray-400" },
    connecting: { color: "text-amber-400", label: "Connecting…", dot: "bg-amber-400 animate-pulse" },
    connected: { color: "text-primary", label: "Connected", dot: "bg-green-500" },
    reconnecting: { color: "text-amber-400", label: "Reconnecting…", dot: "bg-amber-400 animate-pulse" },
    disconnected: { color: "text-red-400", label: "Disconnected", dot: "bg-red-500" },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1.5 text-xs ${config.color}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="hidden sm:inline">{config.label}</span>
    </motion.div>
  );
}

/**
 * Undo/Redo buttons using useUndo, useRedo, useCanUndo, useCanRedo.
 */
function UndoRedoButtons() {
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
        className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground 
                   hover:text-foreground transition-colors disabled:opacity-30 
                   disabled:cursor-not-allowed cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Redo (Ctrl+Shift+Z)"
        className="p-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground 
                   hover:text-foreground transition-colors disabled:opacity-30 
                   disabled:cursor-not-allowed cursor-pointer"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * Quick reaction emoji buttons using useBroadcastEvent.
 */
function ReactionButtons() {
  const sendReaction = useSendReaction();

  return (
    <div className="flex items-center gap-0.5">
      <Zap className="w-3 h-3 text-muted-foreground mr-1" />
      {REACTION_EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => sendReaction(emoji)}
          whileHover={{ scale: 1.3 }}
          whileTap={{ scale: 0.8 }}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-secondary/50 
                     transition-colors cursor-pointer text-sm"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
