import React from "react";
import {
  useOthersConnectionIds,
  useOther,
  useSelf,
} from "@liveblocks/react/suspense";
import { motion, AnimatePresence } from "framer-motion";

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
    name: other.info?.name ?? "Anonymous",
    color: other.info?.color ?? "#888",
    avatar: other.info?.avatar,
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
      {/* Avatar circle */}
      <div
        className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center 
                   text-[10px] font-bold text-white shadow-lg cursor-default
                   transition-transform duration-200 group-hover:scale-110"
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
          data.name.charAt(0).toUpperCase()
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
    name: me.info?.name ?? "You",
    color: me.info?.color ?? "#00FF41",
    avatar: me.info?.avatar,
    canWrite: me.canWrite,
  }));

  const othersConnectionIds = useOthersConnectionIds();

  return (
    <div className="flex items-center gap-1">
      {/* Current user (always first) */}
      <div className="relative group">
        <div
          className="w-7 h-7 rounded-full border-2 border-primary/50 flex items-center justify-center 
                     text-[10px] font-bold text-white shadow-lg cursor-default"
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
            currentUser.name.charAt(0).toUpperCase()
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
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background" />
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
