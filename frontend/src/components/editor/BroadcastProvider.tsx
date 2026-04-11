import { useState, useCallback } from "react";
import {
  useBroadcastEvent,
  useEventListener,
  useSelf,
} from "@liveblocks/react/suspense";
import { motion, AnimatePresence } from "framer-motion";

type PingAnimation = {
  id: string;
  lineNumber: number;
  fromUser: string;
  emoji?: string;
};

/**
 * Provides broadcast event capabilities for the room.
 * 
 * Supports three event types:
 * - ATTENTION_PING: Flash a line to draw attention
 * - REACTION: Emoji burst from a user
 * - SYSTEM: System-level messages
 *
 * Uses useBroadcastEvent to send + useEventListener to receive.
 */
export function BroadcastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pings, setPings] = useState<PingAnimation[]>([]);
  const [reactions, setReactions] = useState<PingAnimation[]>([]);
  const self = useSelf();

  const removePing = useCallback((id: string) => {
    setPings((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const removeReaction = useCallback((id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // ─── Listen for incoming broadcast events ─────────────────
  useEventListener(({ event, connectionId }) => {
    // Don't show our own events
    if (connectionId === self?.connectionId) return;

    switch (event.type) {
      case "ATTENTION_PING": {
        const id = crypto.randomUUID();
        setPings((prev) => [
          ...prev,
          { id, lineNumber: event.lineNumber, fromUser: event.fromUser },
        ]);
        setTimeout(() => removePing(id), 3000);
        break;
      }
      case "REACTION": {
        const id = crypto.randomUUID();
        setReactions((prev) => [
          ...prev,
          { id, lineNumber: 0, fromUser: event.fromUser, emoji: event.emoji },
        ]);
        setTimeout(() => removeReaction(id), 2500);
        break;
      }
      case "SYSTEM": {
        // System messages handled by ConnectionToast already
        break;
      }
    }
  });

  return (
    <>
      {children}

      {/* ─── Attention Ping Overlay ───────────────────────────── */}
      <AnimatePresence>
        {pings.map((ping) => (
          <motion.div
            key={ping.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] pointer-events-none"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/15 border border-primary/30 backdrop-blur-xl shadow-xl">
              <span className="text-primary text-sm animate-pulse">📍</span>
              <span className="text-sm text-foreground">
                <strong className="text-primary">{ping.fromUser}</strong> pinged
                line {ping.lineNumber}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ─── Reaction Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1.5 }}
            exit={{ opacity: 0, y: -80, scale: 0.3 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="fixed bottom-20 right-10 z-[9998] pointer-events-none text-4xl"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </>
  );
}

// ─── Exported helper hooks for sending broadcast events ──────

/**
 * Hook to get a function that sends an attention ping to all users.
 */
export function useSendAttentionPing() {
  const broadcast = useBroadcastEvent();
  const self = useSelf();

  return useCallback(
    (lineNumber: number) => {
      broadcast({
        type: "ATTENTION_PING",
        lineNumber,
        fromUser: self?.info?.name ?? "Someone",
      });
    },
    [broadcast, self]
  );
}

/**
 * Hook to get a function that sends a reaction emoji to all users.
 */
export function useSendReaction() {
  const broadcast = useBroadcastEvent();
  const self = useSelf();

  return useCallback(
    (emoji: string) => {
      broadcast({
        type: "REACTION",
        emoji,
        fromUser: self?.info?.name ?? "Someone",
      });
    },
    [broadcast, self]
  );
}
