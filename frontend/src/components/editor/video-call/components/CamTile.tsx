import { ParticipantTile, type TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { MicOff, Pin, PinOff } from "lucide-react";
import { displayName } from "../utils";

export type CamTileSize = "sm" | "md" | "lg" | "grid";

interface CamTileProps {
  trackRef: TrackReferenceOrPlaceholder;
  speaking: boolean;
  mirrored?: boolean;
  /** Reserved for per-size tile chrome; currently all tiles share one look. */
  size?: CamTileSize;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

/** Camera tile with speaking ring, name label, mic badge, and pin action. */
export function CamTile({
  trackRef,
  speaking,
  mirrored,
  isPinned,
  onTogglePin,
}: CamTileProps) {
  const p = trackRef.participant;
  const label = displayName(p.identity, p.name);
  const micOff = !p.isMicrophoneEnabled;

  return (
    <div
      className={`group/tile relative rounded-xl overflow-hidden bg-black/50 border transition-colors w-full aspect-video ${
        speaking
          ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-glass-border/40"
      } ${mirrored ? "[&>video]:-scale-x-100 [&_video]:-scale-x-100" : ""}`}
      title={label}
    >
      <ParticipantTile
        trackRef={trackRef}
        className="h-full w-full [&_video]:object-cover"
      />
      <span className="absolute bottom-1 left-1.5 max-w-[80%] truncate text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
        {isPinned && (
          <Pin className="w-2.5 h-2.5 text-primary fill-primary shrink-0" />
        )}
        <span className="truncate">{label}</span>
      </span>
      {onTogglePin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={isPinned ? "Unpin participant" : "Pin participant"}
          aria-label={isPinned ? "Unpin participant" : "Pin participant"}
          className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md transition-all cursor-pointer z-20 ${
            isPinned
              ? "bg-primary text-background opacity-100 shadow-md"
              : "bg-black/60 text-white/80 opacity-0 group-hover/tile:opacity-100 hover:text-white hover:bg-black/80"
          }`}
        >
          {isPinned ? (
            <PinOff className="w-3 h-3" />
          ) : (
            <Pin className="w-3 h-3" />
          )}
        </button>
      )}
      {micOff && (
        <span className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-red-400 z-10">
          <MicOff className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}
