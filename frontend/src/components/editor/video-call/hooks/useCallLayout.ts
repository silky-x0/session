import { useMemo } from "react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import type { CallMode } from "../types";
import type { Viewport } from "./useDraggablePosition";
import {
  MAX_FOCUS_WIDTH,
  MAX_GRID_TILES,
  MAX_STRIP_TILES,
  MIN_FOCUS_WIDTH,
} from "../constants";

interface LayoutInput {
  camTracks: TrackReferenceOrPlaceholder[];
  screenTracks: TrackReferenceOrPlaceholder[];
  mode: CallMode;
  viewport: Viewport;
  pinnedIdentity: string | null;
}

/**
 * Pure derivation of which track goes where.
 * Single place to change layout rules (hero vs grid vs strip, overflow caps,
 * focus-window fit sizing). No side effects.
 */
export function useCallLayout({
  camTracks,
  screenTracks,
  mode,
  viewport,
  pinnedIdentity,
}: LayoutInput) {
  const share = screenTracks[0] ?? null;

  const localCam = useMemo(
    () => camTracks.find((t) => t.participant.isLocal) ?? null,
    [camTracks],
  );
  const remoteCams = useMemo(
    () => camTracks.filter((t) => !t.participant.isLocal),
    [camTracks],
  );

  const pinnedTrack = useMemo(
    () =>
      pinnedIdentity
        ? (camTracks.find((t) => t.participant.identity === pinnedIdentity) ??
          null)
        : null,
    [camTracks, pinnedIdentity],
  );

  const heroTrack = pinnedTrack ?? remoteCams[0] ?? localCam;
  const stripTracks = useMemo(
    () => camTracks.filter((t) => t !== heroTrack),
    [camTracks, heroTrack],
  );
  const overflow = Math.max(0, stripTracks.length - MAX_STRIP_TILES);

  // Balanced equal grid when 2+ participants share focus with no pin/share.
  const isGridView =
    mode === "focus" && !share && !pinnedIdentity && camTracks.length >= 2;

  const gridOverflow = Math.max(0, camTracks.length - MAX_GRID_TILES);

  // Fit the focus window to viewport width AND height (16:9 hero estimate).
  const focusW = Math.round(
    Math.min(
      MAX_FOCUS_WIDTH,
      viewport.w - 32,
      Math.max(MIN_FOCUS_WIDTH, ((viewport.h - 210) * 16) / 9),
    ),
  );

  return {
    share,
    localCam,
    remoteCams,
    pinnedTrack,
    heroTrack,
    stripTracks,
    overflow,
    isGridView,
    gridOverflow,
    focusW,
  };
}
