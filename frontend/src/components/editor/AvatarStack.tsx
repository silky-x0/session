import React from "react";
import {
  useOthersConnectionIds,
  useOther,
  useSelf,
} from "@liveblocks/react/suspense";
import { motion, AnimatePresence } from "framer-motion";
import { DiceBearAvatar } from "./DiceBearAvatar";

/**
 * Renders a single avatar for a specific user by connectionId.
 * Uses useOther for optimal per-user rerendering.
 */
const UserAvatar = React.memo(function UserAvatar({
  connectionId,
}: {
  connectionId: number;
}) {
  const data = useOther(connectionId, (other) => ({
    name: other.presence.info?.name ?? other.info?.name ?? "Anonymous",
    color: other.presence.info?.color ?? other.info?.color ?? "var(--color-muted-foreground)",
    avatar: other.info?.avatar,
    avatarSeed: other.presence.info?.avatarSeed ?? other.info?.avatarSeed,
  }));

  if (!data) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className="relative group"
    >
      <div
        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-background flex items-center justify-center 
                   text-[9px] font-bold text-white shadow-md cursor-default
                   transition-transform duration-200 group-hover:scale-110 overflow-hidden"
        style={{
          backgroundColor: data.color,
          boxShadow: `0 0 8px ${data.color}40`,
        }}
      >
        {data.avatar ? (
          <img
            src={data.avatar}
            alt={data.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <DiceBearAvatar seed={data.avatarSeed ?? data.name} size={24} className="w-full h-full" />
        )}
      </div>

      {/* Tooltip on hover */}
      <div
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] 
                   bg-card border border-border text-foreground whitespace-nowrap opacity-0 
                   group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg"
      >
        {data.name}
      </div>
    </motion.div>
  );
});

/**
 * Avatar stack showing the current user + all other connected users.
 * Uses useOthersConnectionIds + useOther pattern for optimal rerendering:
 * - Parent only rerenders when users join/leave
 * - Each avatar only rerenders when its own data changes
 */
export function AvatarStack() {
  const currentUser = useSelf((me) => ({
    name: me.presence.info?.name ?? me.info?.name ?? "You",
    color: me.presence.info?.color ?? me.info?.color ?? "var(--color-neon-pulse)",
    avatar: me.info?.avatar,
    avatarSeed: me.presence.info?.avatarSeed ?? me.info?.avatarSeed,
    canWrite: me.canWrite,
  }));

  const othersConnectionIds = useOthersConnectionIds();

  return (
    <div className="flex items-center gap-1">
      {/* Current user (always first) */}
      <div className="relative group">
        <div
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[1.5px] border-primary/50 flex items-center justify-center 
                     text-[9px] font-bold text-white shadow-md cursor-default overflow-hidden"
          style={{
            backgroundColor: currentUser.color,
            boxShadow: `0 0 10px ${currentUser.color}50`,
          }}
        >
          {currentUser.avatar ? (
            <img
              src={currentUser.avatar}
              alt="You"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <DiceBearAvatar seed={currentUser.avatarSeed ?? currentUser.name} size={24} className="w-full h-full" />
          )}
        </div>
        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] 
                     bg-card border border-border text-foreground whitespace-nowrap opacity-0 
                     group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg"
        >
          You {!currentUser.canWrite && "(read-only)"}
        </div>
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-background" />
      </div>

      {/* Other users (stacked with overlap) */}
      <AnimatePresence>
        {othersConnectionIds.map((connectionId) => (
          <div key={connectionId} className="-ml-2">
            <UserAvatar connectionId={connectionId} />
          </div>
        ))}
      </AnimatePresence>

      {/* User count */}
      {othersConnectionIds.length > 0 && (
        <span className="text-[10px] text-muted-foreground ml-1 hidden sm:inline">
          {othersConnectionIds.length + 1} online
        </span>
      )}
    </div>
  );
}
