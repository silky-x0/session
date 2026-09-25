import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { MAX_GRID_TILES, MAX_STRIP_TILES } from "../constants";
import type { CallMode } from "../types";
import { CamTile } from "./CamTile";

interface ParticipantGridProps {
  tracks: TrackReferenceOrPlaceholder[];
  isSpeaking: (identity: string) => boolean;
  pinnedIdentity: string | null;
  onTogglePin: (identity: string) => void;
}

/** Balanced equal grid for focus mode with no pin/share (caps at 4 + overflow). */
export function ParticipantGrid({
  tracks,
  isSpeaking,
  pinnedIdentity,
  onTogglePin,
}: ParticipantGridProps) {
  return (
    <div className="grid gap-2 grid-cols-2">
      {tracks.slice(0, MAX_GRID_TILES).map((t) => (
        <CamTile
          key={t.participant.identity}
          trackRef={t}
          size="grid"
          speaking={isSpeaking(t.participant.identity)}
          mirrored={t.participant.isLocal}
          isPinned={pinnedIdentity === t.participant.identity}
          onTogglePin={() => onTogglePin(t.participant.identity)}
        />
      ))}
      {tracks.length > MAX_GRID_TILES && (
        <div
          title={`${tracks.length - MAX_GRID_TILES} more in call`}
          className="aspect-video w-full rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground"
        >
          +{tracks.length - MAX_GRID_TILES} more
        </div>
      )}
    </div>
  );
}

interface HeroStageProps {
  heroTrack: TrackReferenceOrPlaceholder | null;
  stripTracks: TrackReferenceOrPlaceholder[];
  overflow: number;
  mode: CallMode;
  isSpeaking: (identity: string) => boolean;
  pinnedIdentity: string | null;
  onTogglePin: (identity: string) => void;
}

/** Single hero tile + up-to-3 strip tiles. Used for preview and pinned/focus states. */
export function HeroStage({
  heroTrack,
  stripTracks,
  overflow,
  mode,
  isSpeaking,
  pinnedIdentity,
  onTogglePin,
}: HeroStageProps) {
  return (
    <>
      {heroTrack && (
        <CamTile
          trackRef={heroTrack}
          size={mode === "focus" ? "lg" : "md"}
          speaking={isSpeaking(heroTrack.participant.identity)}
          mirrored={heroTrack.participant.isLocal}
          isPinned={pinnedIdentity === heroTrack.participant.identity}
          onTogglePin={() => onTogglePin(heroTrack.participant.identity)}
        />
      )}
      {stripTracks.length > 0 && (
        <div
          className={`flex gap-2 ${mode === "preview" ? "" : "overflow-x-auto pb-1"}`}
        >
          {stripTracks.slice(0, MAX_STRIP_TILES).map((t) => (
            <div
              key={t.participant.identity}
              className={
                mode === "preview" ? "flex-1 min-w-0" : "w-28 shrink-0"
              }
            >
              <CamTile
                trackRef={t}
                size="sm"
                speaking={isSpeaking(t.participant.identity)}
                mirrored={t.participant.isLocal}
                isPinned={pinnedIdentity === t.participant.identity}
                onTogglePin={() => onTogglePin(t.participant.identity)}
              />
            </div>
          ))}
          {overflow > 0 && (
            <div
              title={`${overflow} more in call`}
              className={
                mode === "preview"
                  ? "flex-1 min-w-0 aspect-video rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground"
                  : "w-28 aspect-video shrink-0 rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground"
              }
            >
              +{overflow}
            </div>
          )}
        </div>
      )}
    </>
  );
}
