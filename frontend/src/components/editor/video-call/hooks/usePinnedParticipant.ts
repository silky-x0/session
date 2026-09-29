import { useCallback, useEffect, useState } from "react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";

/** Owns pin state and auto-resets when the pinned participant leaves. */
export function usePinnedParticipant(camTracks: TrackReferenceOrPlaceholder[]) {
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

  useEffect(() => {
    if (
      pinnedIdentity &&
      !camTracks.some((t) => t.participant.identity === pinnedIdentity)
    ) {
      // Auto-reset when the pinned participant leaves.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPinnedIdentity(null);
    }
  }, [camTracks, pinnedIdentity]);

  const togglePin = useCallback((identity: string) => {
    setPinnedIdentity((current) => (current === identity ? null : identity));
  }, []);

  const pinnedTrack =
    pinnedIdentity != null
      ? (camTracks.find((t) => t.participant.identity === pinnedIdentity) ??
        null)
      : null;

  return { pinnedIdentity, pinnedTrack, togglePin };
}
