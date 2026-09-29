import { useEffect, useRef } from "react";
import {
  DisconnectButton,
  ParticipantTile,
  TrackToggle,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { RoomAudioRenderer } from "@livekit/components-react";
import { Track } from "livekit-client";
import { PhoneOff, Shrink, X } from "lucide-react";
import { CONTROL_BTN_CLASS, DISCONNECT_BTN_CLASS } from "../constants";
import { displayName } from "../utils";
import { CamTile } from "./CamTile";

interface FullscreenCallProps {
  share: TrackReferenceOrPlaceholder | null;
  heroTrack: TrackReferenceOrPlaceholder | null;
  camTracks: TrackReferenceOrPlaceholder[];
  count: number;
  duration: string;
  isSpeaking: (identity: string) => boolean;
  pinnedIdentity: string | null;
  onTogglePin: (identity: string) => void;
  onToggleFullscreen: () => void;
  onClose: () => void;
  boxRef: React.RefObject<HTMLDivElement | null>;
}

/** Dedicated fullscreen layout (mobile & desktop friendly). */
export function FullscreenCall({
  share,
  heroTrack,
  camTracks,
  count,
  duration,
  isSpeaking,
  pinnedIdentity,
  onTogglePin,
  onToggleFullscreen,
  onClose,
  boxRef,
}: FullscreenCallProps) {
  const fallbackRef = useRef<HTMLDivElement>(null);
  const ref = boxRef ?? fallbackRef;

  useEffect(() => {
    // Keep RoomAudioRenderer-level side effects local if extended later.
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[9999] bg-black flex flex-col select-none overflow-hidden touch-none"
    >
      {/* Fullscreen Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 h-12 bg-black/80 backdrop-blur-md border-b border-white/10 shrink-0 z-30">
        <span className="text-xs sm:text-sm font-mono text-white/90 truncate max-w-[65%]">
          {share
            ? `${displayName(share.participant.identity, share.participant.name)}’s Screen`
            : `${count} in call`}{" "}
          · {duration}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            aria-label="Exit full screen"
            title="Exit full screen"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-white text-xs font-medium cursor-pointer min-h-[36px] border border-white/10 transition duration-150 ease-out active:scale-[0.97]"
          >
            <Shrink className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Exit Full Screen</span>
          </button>
          <button
            onClick={onClose}
            aria-label="Close full screen"
            title="Close full screen"
            className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-white cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border border-white/10 transition duration-150 ease-out active:scale-[0.97]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Display Area */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-4 bg-black overflow-hidden">
        {share ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <ParticipantTile
              trackRef={share}
              className="h-full w-full max-h-full max-w-full [&_video]:object-contain [&_video]:max-h-full [&_video]:w-full"
            />
          </div>
        ) : (
          heroTrack && (
            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
              <CamTile
                trackRef={heroTrack}
                speaking={isSpeaking(heroTrack.participant.identity)}
                mirrored={heroTrack.participant.isLocal}
                isPinned={pinnedIdentity === heroTrack.participant.identity}
                onTogglePin={() =>
                  onTogglePin(heroTrack.participant.identity)
                }
              />
            </div>
          )
        )}
      </div>

      {/* Floating Participant Strip & Controls at Bottom */}
      <div className="p-2 flex items-center justify-between gap-2 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {camTracks.map((t) => (
            <div
              key={t.participant.identity}
              className="w-20 sm:w-28 shrink-0"
            >
              <CamTile
                trackRef={t}
                speaking={isSpeaking(t.participant.identity)}
                mirrored={t.participant.isLocal}
                isPinned={pinnedIdentity === t.participant.identity}
                onTogglePin={() => onTogglePin(t.participant.identity)}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <TrackToggle
            source={Track.Source.Microphone}
            showIcon
            className={CONTROL_BTN_CLASS}
          />
          <TrackToggle
            source={Track.Source.Camera}
            showIcon
            className={CONTROL_BTN_CLASS}
          />
          <TrackToggle
            source={Track.Source.ScreenShare}
            showIcon
            className={CONTROL_BTN_CLASS}
          />
          <button
            onClick={onToggleFullscreen}
            aria-label="Exit full screen"
            title="Exit full screen"
            className={CONTROL_BTN_CLASS}
          >
            <Shrink className="w-4 h-4 text-primary" />
          </button>
          <DisconnectButton className={DISCONNECT_BTN_CLASS}>
            <PhoneOff />
          </DisconnectButton>
        </div>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}
