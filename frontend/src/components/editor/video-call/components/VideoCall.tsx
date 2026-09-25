import { LiveKitRoom } from "@livekit/components-react";
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
  const { creds, error } = useLivekitCredentials(roomId, identity, name);

  if (error) {
    return <CallErrorView error={error} onLeave={onLeave} />;
  }

  if (!creds) return null;

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
