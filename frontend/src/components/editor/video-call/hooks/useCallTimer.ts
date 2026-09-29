import { useEffect, useRef, useState } from "react";
import { formatDuration } from "../utils";

/** Ticks once per second once connected and exposes a mm:ss duration. */
export function useCallTimer(connected: boolean) {
  const [now, setNow] = useState(() => Date.now());
  const connectedAt = useRef<number>(0);

  useEffect(() => {
    if (connected && !connectedAt.current) connectedAt.current = Date.now();
    if (!connected) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [connected]);

  // Intentional render read of a write-once timestamp ref (matches original).
  // eslint-disable-next-line react-hooks/refs
  const duration = formatDuration(now - (connectedAt.current || now));
  return { now, duration };
}
