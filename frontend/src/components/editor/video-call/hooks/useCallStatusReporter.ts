import { useEffect, useRef } from "react";
import type { CallStatus } from "../types";

interface ReporterInput {
  count: number;
  speakingName: string | null;
  muted: boolean;
  onStatus?: (s: CallStatus) => void;
}

/** Reports count / speaking / mute state up for the smart TopBar button. */
export function useCallStatusReporter({
  count,
  speakingName,
  muted,
  onStatus,
}: ReporterInput) {
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    onStatusRef.current?.({ count, speakingName, muted });
  }, [count, speakingName, muted]);
}
