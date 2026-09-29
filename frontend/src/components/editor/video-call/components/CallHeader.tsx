import { Expand, Maximize2, Minimize2, X } from "lucide-react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import type { CallMode } from "../types";
import type { DragHandlers } from "../hooks/useDraggablePosition";

interface CallHeaderProps {
  count: number;
  duration: string;
  share: TrackReferenceOrPlaceholder | null;
  pinnedIdentity: string | null;
  mode: CallMode;
  dragHandlers: DragHandlers;
  onFullscreen: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onCollapse: () => void;
}

const iconBtn =
  "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center transition duration-150 ease-out active:scale-[0.97]";

/** Draggable window header with mode controls. */
export function CallHeader({
  count,
  duration,
  share,
  pinnedIdentity,
  mode,
  dragHandlers,
  onFullscreen,
  onFocus,
  onMinimize,
  onCollapse,
}: CallHeaderProps) {
  return (
    <div
      onPointerDown={dragHandlers.onDragStart}
      onPointerMove={dragHandlers.onDragMove}
      onPointerUp={dragHandlers.onDragEnd}
      className="flex items-center justify-between px-2.5 h-9 cursor-grab active:cursor-grabbing border-b border-border/60 touch-none shrink-0"
    >
      <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[65%]">
        {count} in call · {duration}
        {share ? " · sharing" : ""}
        {pinnedIdentity ? " · pinned" : ""}
      </span>
      <span className="flex items-center gap-1">
        <button
          onClick={onFullscreen}
          aria-label="Full screen"
          title="Full screen view"
          className={iconBtn}
        >
          <Expand className="w-3.5 h-3.5 text-primary" />
        </button>
        {mode === "preview" ? (
          <button
            onClick={onFocus}
            aria-label="Open focus mode"
            title="Focus mode"
            className={iconBtn}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onMinimize}
            aria-label="Minimize call"
            title="Minimize"
            className={iconBtn}
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onCollapse}
          aria-label="Collapse call to status pill"
          title="Collapse to pill"
          className={iconBtn}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </span>
    </div>
  );
}
