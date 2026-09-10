import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Loader2 } from "lucide-react";
import { getLivekitCredentials } from "@/lib/livekit";

interface VideoCallProps {
  roomId: string;
  identity: string;
  name: string;
  onLeave: () => void;
}

function VideoGrid() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  if (tracks.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground px-4 py-6">
        <Loader2 className="w-4 h-4 animate-spin" />
        Waiting for others to join…
      </div>
    );
  }

  return (
    <GridLayout
      tracks={tracks}
      className="grid gap-2 p-2 max-h-[320px] overflow-auto"
    >
      <ParticipantTile className="rounded-xl overflow-hidden border border-glass-border/40 bg-black/40 min-h-[140px]" />
    </GridLayout>
  );
}

export function VideoCall({ roomId, identity, name, onLeave }: VideoCallProps) {
  const [creds, setCreds] = useState<{ token: string; url: string } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
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
  }, [roomId, identity, name]);

  if (error) {
    return (
      <div className="glass-panel rounded-xl p-3 text-xs text-red-400 flex items-center justify-between gap-2">
        <span>Call failed: {error}</span>
        <button
          onClick={onLeave}
          className="px-2 py-1 rounded-md bg-secondary border border-border text-foreground cursor-pointer min-h-[44px] min-w-[44px]"
        >
          Close
        </button>
      </div>
    );
  }

  if (!creds) {
    return (
      <div className="glass-panel rounded-xl p-3 text-xs text-muted-foreground flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Joining call…
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden border border-glass-border/40">
      <LiveKitRoom
        serverUrl={creds.url}
        token={creds.token}
        connect
        audio
        video
        onDisconnected={onLeave}
        className="flex flex-col"
      >
        <VideoGrid />
        <RoomAudioRenderer />
        <ControlBar
          className="flex items-center justify-center gap-2 p-2 border-t border-border"
          controls={{ screenShare: true }}
        />
      </LiveKitRoom>
    </div>
  );
}
