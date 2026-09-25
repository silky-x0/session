import { useState } from "react";
import {
  RoomAudioRenderer,
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipants,
  useSpeakingParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";
import { Track } from "livekit-client";
import type { CallMode, CallStatus } from "../types";
import { displayName } from "../utils";
import { useCallTimer } from "../hooks/useCallTimer";
import { useDraggablePosition } from "../hooks/useDraggablePosition";
import { usePinnedParticipant } from "../hooks/usePinnedParticipant";
import { useFullscreenMode } from "../hooks/useFullscreenMode";
import { useCallLayout } from "../hooks/useCallLayout";
import { useScreenShareAutoFocus } from "../hooks/useScreenShareAutoFocus";
import { useCallStatusReporter } from "../hooks/useCallStatusReporter";
import { CamTile } from "./CamTile";
import { MinimalPill } from "./MinimalPill";
import { CallHeader } from "./CallHeader";
import { CallControls } from "./CallControls";
import { ScreenshareView } from "./ScreenshareView";
import { HeroStage, ParticipantGrid } from "./ParticipantViews";
import { FloatingCallWindow } from "./FloatingCallWindow";
import { FullscreenCall } from "./FullscreenCall";

interface CallSessionProps {
  onStatus?: (s: CallStatus) => void;
}

/**
 * Orchestrator (formerly CallLayerInner).
 * Owns LiveKit subscriptions + composition only — all stateful logic
 * lives in hooks, all markup lives in child components.
 */
export function CallSession({ onStatus }: CallSessionProps) {
  const roomState = useConnectionState();
  const connected = roomState === ConnectionState.Connected;
  const { isMicrophoneEnabled } = useLocalParticipant();
  const remotes = useRemoteParticipants();
  const speaking = useSpeakingParticipants();

  const camTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: true }],
    { onlySubscribed: false },
  );
  const screenTracks = useTracks(
    [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  const [mode, setMode] = useState<CallMode>("minimal");

  const { duration } = useCallTimer(connected);
  const { boxRef, pos, viewport, dragHandlers, suppressClickRef } =
    useDraggablePosition(mode);
  const { pinnedIdentity, togglePin } = usePinnedParticipant(camTracks);
  const { isFullscreen, toggleFullscreen } = useFullscreenMode(boxRef);

  const {
    share,
    localCam,
    remoteCams,
    heroTrack,
    stripTracks,
    overflow,
    isGridView,
    focusW,
  } = useCallLayout({
    camTracks,
    screenTracks,
    mode,
    viewport,
    pinnedIdentity,
  });

  const { minimizeShare } = useScreenShareAutoFocus(share, setMode);

  const count = remotes.length + 1;
  const remoteSpeaker = speaking.find((p) => !p.isLocal);
  const speakingName = remoteSpeaker
    ? displayName(remoteSpeaker.identity, remoteSpeaker.name)
    : null;

  useCallStatusReporter({
    count,
    speakingName,
    muted: !isMicrophoneEnabled,
    onStatus,
  });

  const isSpeaking = (identity: string) =>
    speaking.some((p) => p.identity === identity);

  if (isFullscreen) {
    return (
      <FullscreenCall
        share={share}
        heroTrack={heroTrack}
        camTracks={camTracks}
        count={count}
        duration={duration}
        isSpeaking={isSpeaking}
        pinnedIdentity={pinnedIdentity}
        onTogglePin={togglePin}
        onToggleFullscreen={toggleFullscreen}
        onClose={() => {
          toggleFullscreen();
          setMode("minimal");
        }}
        boxRef={boxRef}
      />
    );
  }

  return (
    <div
      ref={boxRef}
      className="fixed z-[90] select-none"
      style={
        pos
          ? { left: pos.x, top: pos.y }
          : { left: viewport.w < 640 ? 12 : 24, bottom: viewport.w < 640 ? 12 : 24 }
      }
    >
      {mode === "minimal" && (
        <MinimalPill
          localCam={localCam}
          remoteCams={remoteCams}
          count={count}
          duration={duration}
          isMicrophoneEnabled={isMicrophoneEnabled}
          isSpeaking={isSpeaking}
          onOpen={() => setMode("preview")}
          dragHandlers={dragHandlers}
          suppressClickRef={suppressClickRef}
        />
      )}

      {mode !== "minimal" && (
        <FloatingCallWindow
          mode={mode}
          focusW={focusW}
          header={
            <CallHeader
              count={count}
              duration={duration}
              share={share}
              pinnedIdentity={pinnedIdentity}
              mode={mode}
              dragHandlers={dragHandlers}
              onFullscreen={toggleFullscreen}
              onFocus={() => setMode("focus")}
              onMinimize={() =>
                share ? minimizeShare() : setMode("preview")
              }
              onCollapse={() => setMode("minimal")}
            />
          }
          controls={<CallControls />}
        >
          {mode === "focus" && share ? (
            <>
              <ScreenshareView share={share} onFullscreen={toggleFullscreen} />
              <div className="flex gap-2 overflow-x-auto pb-1">
                {camTracks.map((t) => (
                  <div key={t.participant.identity} className="w-28 shrink-0">
                    <CamTile
                      trackRef={t}
                      size="sm"
                      speaking={isSpeaking(t.participant.identity)}
                      mirrored={t.participant.isLocal}
                      isPinned={pinnedIdentity === t.participant.identity}
                      onTogglePin={() => togglePin(t.participant.identity)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : isGridView ? (
            <ParticipantGrid
              tracks={camTracks}
              isSpeaking={isSpeaking}
              pinnedIdentity={pinnedIdentity}
              onTogglePin={togglePin}
            />
          ) : (
            <HeroStage
              heroTrack={heroTrack}
              stripTracks={stripTracks}
              overflow={overflow}
              mode={mode}
              isSpeaking={isSpeaking}
              pinnedIdentity={pinnedIdentity}
              onTogglePin={togglePin}
            />
          )}
        </FloatingCallWindow>
      )}

      <RoomAudioRenderer />
    </div>
  );
}
