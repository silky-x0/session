import { useEffect, useRef } from "react";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";
import type { CallMode } from "../types";

interface ShareBehavior {
  minimizeShare: () => void;
}

/**
 * Screen share forces focus mode; ending the share drops back to preview.
 * A manual minimize is respected until that share track ends.
 */
export function useScreenShareAutoFocus(
  share: TrackReferenceOrPlaceholder | null,
  setMode: React.Dispatch<React.SetStateAction<CallMode>>,
): ShareBehavior {
  const autoFocused = useRef(false);
  const dismissedShareSid = useRef<string | null>(null);

  useEffect(() => {
    if (share) {
      if (dismissedShareSid.current !== share.publication?.trackSid) {
        autoFocused.current = true;
        setMode("focus");
      }
    } else {
      dismissedShareSid.current = null;
      if (autoFocused.current) {
        autoFocused.current = false;
        setMode((m) => (m === "focus" ? "preview" : m));
      }
    }
  }, [share, setMode]);

  const minimizeShare = () => {
    if (share?.publication?.trackSid) {
      dismissedShareSid.current = share.publication.trackSid;
    }
    autoFocused.current = false;
    setMode("preview");
  };

  return { minimizeShare };
}
