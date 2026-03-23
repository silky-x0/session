import { useSyncStatus } from "@liveblocks/react/suspense";
import { Cloud, Loader2 } from "lucide-react";

/**
 * Displays a sync status badge ("Saved" / "Saving…") using useSyncStatus.
 * The { smooth: true } option prevents flickering during rapid changes —
 * it delays showing "Saved" until 1s after the final change.
 */
export function SyncStatusBadge() {
  const syncStatus = useSyncStatus({ smooth: true });

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {syncStatus === "synchronized" ? (
        <span className="flex items-center gap-1 text-primary/70">
          <Cloud className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Saved</span>
        </span>
      ) : (
        <span className="flex items-center gap-1 text-amber-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span className="hidden sm:inline">Saving…</span>
        </span>
      )}
    </div>
  );
}
