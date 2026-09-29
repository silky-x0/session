import { LiveKitRoom } from "@livekit/components-react";
import { Loader2 } from "lucide-react";
import type { VideoCallProps } from "../types";
import { useLivekitCredentials } from "../hooks/useLivekitCredentials";
import { CallSession } from "./CallSession";
import { CallErrorView } from "./CallErrorView";

/**
 * Container: credential lifecycle + LiveKit provider.
 * Must stay mounted inside LiveKitRoom — inner session holds all call state.
 */
export function VideoCall({
  roomId,
  identity,
  name,
  onLeave,
  onStatus,
}: VideoCallProps) {
  const { creds, error, retry } = useLivekitCredentials(roomId, identity, name);

  if (error) {
    return <CallErrorView error={error} onLeave={onLeave} onRetry={retry} />;
  }

  if (!creds) {
    return (
      <div
        className="fixed left-6 bottom-6 z-[90] glass-panel rounded-full pl-2 pr-4 h-12 flex items-center gap-2"
        role="status"
        aria-label="Joining call"
      >
        <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </span>
        <span className="text-[11px] font-mono text-muted-foreground">
          Joining…
        </span>
      </div>
    );
  }

  return (
    <div className="group">
      <LiveKitRoom
        serverUrl={creds.url}
        token={creds.token}
        connect
        audio
        video
        onDisconnected={onLeave}
      >
        <CallSession onStatus={onStatus} />
      </LiveKitRoom>
    </div>
  );
}
