import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Mic, MicOff } from "lucide-react";
import type { DragHandlers } from "../hooks/useDraggablePosition";
import { displayName, initials } from "../utils";

interface MinimalPillProps {
  localCam: TrackReferenceOrPlaceholder | null;
  remoteCams: TrackReferenceOrPlaceholder[];
  count: number;
  duration: string;
  isMicrophoneEnabled: boolean;
  isSpeaking: (identity: string) => boolean;
  onOpen: () => void;
  dragHandlers: DragHandlers;
  suppressClickRef: React.RefObject<boolean>;
}

/** Collapsed status pill. Click opens preview; drag repositions. */
export function MinimalPill({
  localCam,
  remoteCams,
  count,
  duration,
  isMicrophoneEnabled,
  isSpeaking,
  onOpen,
  dragHandlers,
  suppressClickRef,
}: MinimalPillProps) {
  return (
    <button
      onClick={() => {
        // Drag shouldn't fire preview.
        if (suppressClickRef.current) {
          suppressClickRef.current = false;
          return;
        }
        onOpen();
      }}
      onPointerDown={dragHandlers.onDragStart}
      onPointerMove={dragHandlers.onDragMove}
      onPointerUp={dragHandlers.onDragEnd}
      aria-label="Open call preview"
      title="Open call preview"
      className="flex items-center gap-2 h-12 pl-2 pr-3 rounded-full glass-panel border border-glass-border/40 cursor-pointer hover:border-primary/40 transition-colors touch-none"
    >
      <span className="flex -space-x-2">
        {[localCam, ...remoteCams.slice(0, 2)].map(
          (t, i) =>
            t && (
              <span
                key={t.participant.identity + i}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background ${
                  isSpeaking(t.participant.identity)
                    ? "bg-primary text-background"
                    : "bg-secondary text-foreground"
                }`}
              >
                {initials(
                  displayName(t.participant.identity, t.participant.name),
                )}
              </span>
            ),
        )}
      </span>
      <span className="text-[11px] font-mono text-muted-foreground">
        {count} · {duration}
      </span>
      {isMicrophoneEnabled ? (
        <Mic className="w-3.5 h-3.5 text-primary" />
      ) : (
        <MicOff className="w-3.5 h-3.5 text-red-400" />
      )}
    </button>
  );
}
