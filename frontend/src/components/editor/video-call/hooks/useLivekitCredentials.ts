import { useEffect, useState } from "react";
import { getLivekitCredentials } from "@/lib/livekit";

export interface LivekitCredentials {
  token: string;
  url: string;
}

/** Fetches a LiveKit token for the given room/identity. Single responsibility: credential lifecycle. */
export function useLivekitCredentials(
  roomId: string,
  identity: string,
  name: string,
) {
  const [creds, setCreds] = useState<LivekitCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // Sync reset on room/identity change + async token fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null);
    setCreds(null);
    getLivekitCredentials(roomId, identity, name)
      .then((c) => {
        if (!cancelled) setCreds(c);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [roomId, identity, name, attempt]);

  return { creds, error, retry: () => setAttempt((a) => a + 1) };
}
