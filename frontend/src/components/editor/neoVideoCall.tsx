import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ParticipantTile,
  TrackToggle,
  DisconnectButton,
  useTracks,
  useLocalParticipant,
  useRemoteParticipants,
  useSpeakingParticipants,
  useConnectionState,
  type TrackReferenceOrPlaceholder,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import {
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  PhoneOff,
  X,
} from "lucide-react";
import { getLivekitCredentials } from "@/lib/livekit";

export interface CallStatus {
  count: number;
  speakingName: string | null;
  muted: boolean;
}

interface VideoCallProps {
  roomId: string;
  identity: string;
  name: string;
  onLeave: () => void;
  onStatus?: (s: CallStatus) => void;
}

type CallMode = "minimal" | "preview" | "focus";

const POS_KEY = "session-call-pos";

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function displayName(identity: string, name?: string): string {
  if (name) return name;
  const dash = identity.lastIndexOf("-");
  return dash > 0 ? identity.slice(0, dash) : identity;
}

function initials(label: string): string {
  return label
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Small camera tile with speaking ring, name label, mic badge. */
function CamTile({
  trackRef,
  speaking,
  mirrored,
  size,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  speaking: boolean;
  mirrored?: boolean;
  size: "sm" | "md" | "lg";
}) {
  const p = trackRef.participant;
  const label = displayName(p.identity, p.name);
  const micOff = !p.isMicrophoneEnabled;
  const h = size === "sm" ? "h-12" : size === "md" ? "h-24" : "h-full min-h-[180px]";

  return (
    <div
      className={`group/tile relative rounded-xl overflow-hidden bg-black/50 border transition-colors ${h} ${
        speaking
          ? "border-primary shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-glass-border/40"
      } ${mirrored ? "[&>video]:-scale-x-100 [&_video]:-scale-x-100" : ""}`}
      title={label}
    >
      <ParticipantTile
        trackRef={trackRef}
        className="h-full w-full [&_video]:object-cover"
      />
      <span className="absolute bottom-1 left-1.5 max-w-[80%] truncate text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
        {label}
      </span>
      {micOff && (
        <span className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-red-400">
          <MicOff className="w-3 h-3" />
        </span>
      )}
    </div>
  );
}

function CallLayerInner({
  onLeave,
  onStatus,
}: {
  onLeave: () => void;
  onStatus?: ((s: CallStatus) => void) | undefined;
}) {
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
  const [pos, setPos] = useState<{ x: number; y: number } | null>(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      return raw ? (JSON.parse(raw) as { x: number; y: number }) : null;
    } catch {
      return null;
    }
  });
  const [now, setNow] = useState(() => Date.now());
  const [vp, setVp] = useState(() => ({
    w: typeof window !== "undefined" ? window.innerWidth : 1280,
    h: typeof window !== "undefined" ? window.innerHeight : 800,
  }));
  const connectedAt = useRef<number>(0);
  const autoFocused = useRef(false);
  const dismissedShareSid = useRef<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dx: number; dy: number; sx: number; sy: number } | null>(null);
  const suppressClickRef = useRef(false);
  const onStatusRef = useRef(onStatus);
  onStatusRef.current = onStatus;

  const count = remotes.length + 1;
  const remoteSpeaker = speaking.find((p) => !p.isLocal);
  const speakingName = remoteSpeaker
    ? displayName(remoteSpeaker.identity, remoteSpeaker.name)
    : null;
  const share = screenTracks[0] ?? null;

  // Report status up for the smart TopBar button.
  useEffect(() => {
    onStatusRef.current?.({
      count,
      speakingName,
      muted: !isMicrophoneEnabled,
    });
  }, [count, speakingName, isMicrophoneEnabled]);

  // Call timer.
  useEffect(() => {
    if (connected && !connectedAt.current) connectedAt.current = Date.now();
    if (!connected) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [connected]);

  // Screen share = auto focus. Respect a manual minimize until share ends.
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
  }, [share]);

  const clampPos = useCallback((x: number, y: number) => {
    const el = boxRef.current;
    const w = el?.offsetWidth ?? 280;
    const h = el?.offsetHeight ?? 48;
    // Free drag across the whole viewport, including over the right rail.
    const reserve = 8;
    return {
      x: Math.min(Math.max(8, x), Math.max(8, window.innerWidth - reserve - w)),
      y: Math.min(Math.max(8, y), Math.max(8, window.innerHeight - h - 8)),
    };
  }, []);

  const onDragStart = (e: React.PointerEvent) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    dragRef.current = {
      dx: e.clientX - r.left,
      dy: e.clientY - r.top,
      sx: e.clientX,
      sy: e.clientY,
    };
    suppressClickRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 6) {
      suppressClickRef.current = true;
    }
    setPos(clampPos(e.clientX - d.dx, e.clientY - d.dy));
  };
  const onDragEnd = () => {
    dragRef.current = null;
    try {
      const el = boxRef.current;
      if (el) {
        const r = el.getBoundingClientRect();
        localStorage.setItem(
          POS_KEY,
          JSON.stringify({ x: Math.round(r.left), y: Math.round(r.top) }),
        );
      }
    } catch {
      /* storage unavailable */
    }
  };

  // Re-clamp after minimize/maximize: the box size changes, so a saved
  // position that fit the old size can push the new size out of viewport.
  useLayoutEffect(() => {
    setPos((p) => {
      if (!p) return p;
      const c = clampPos(p.x, p.y);
      return c.x === p.x && c.y === p.y ? p : c;
    });
  }, [mode, clampPos]);

  // Reset a stale saved position on resize + track viewport for fit sizing.
  useEffect(() => {
    const onResize = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      setPos((p) => {
        if (!p) return p;
        const c = clampPos(p.x, p.y);
        return c.x === p.x && c.y === p.y ? p : null;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampPos]);

  const minimizeShare = () => {
    if (share?.publication?.trackSid) {
      dismissedShareSid.current = share.publication.trackSid;
    }
    autoFocused.current = false;
    setMode("preview");
  };

  const isSpeaking = (identity: string) =>
    speaking.some((p) => p.identity === identity);

  const localCam = camTracks.find((t) => t.participant.isLocal) ?? null;
  const remoteCams = camTracks.filter((t) => !t.participant.isLocal);
  const heroTrack = remoteCams[0] ?? localCam;
  const stripTracks = (remoteCams[0] ? [localCam, ...remoteCams.slice(1)] : remoteCams.slice(0)).filter(
    Boolean,
  ) as TrackReferenceOrPlaceholder[];
  const overflow = Math.max(0, count - 3);

  const duration = formatDuration(now - (connectedAt.current || now));

  // Focus width computed in JS: fits viewport width AND height (16:9 video
  // plus ~210px of header/strip/controls chrome). No scroll, no clipping.
  const focusW = Math.round(
    Math.min(680, vp.w - 32, Math.max(264, ((vp.h - 210) * 16) / 9)),
  );

  const controlBtn =
    "flex items-center justify-center w-11 h-11 rounded-full bg-secondary/80 border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4";

  return (
    <div
      ref={boxRef}
      className="fixed z-[90] select-none"
      style={
        pos
          ? { left: pos.x, top: pos.y }
          : { left: 24, bottom: 24 }
      }
    >
      {mode === "minimal" && (
        <button
          onClick={() => {
            // this so drag doesnt fire preview
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            setMode("preview");
          }}
          onPointerDown={onDragStart}
          onPointerMove={onDragMove}
          onPointerUp={onDragEnd}
          aria-label="Open call preview"
          title="Open call preview"
          className="flex items-center gap-2 h-12 pl-2 pr-3 rounded-full glass-panel border border-glass-border/40 cursor-pointer hover:border-primary/40 transition-colors"
        >
          <span className="flex -space-x-2">
            {[localCam, ...remoteCams.slice(0, 2)].map(
              (t, i) =>
                t && (
                  <span
                    key={t.participant.identity + i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background ${
                      isSpeaking(t.participant.identity)
                        ? "bg-primary text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {initials(
                      displayName(
                        t.participant.identity,
                        t.participant.name,
                      ),
                    )}
                  </span>
                ),
            )}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {count} · {duration}
          </span>
          {isMicrophoneEnabled ? (
            <Mic className="w-3.5 h-3.5 text-primary" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-red-400" />
          )}
        </button>
      )}

      {mode !== "minimal" && (
        <div
          className={`glass-panel rounded-2xl overflow-hidden border border-glass-border/40 ${
            mode === "focus" ? "" : "w-[264px]"
          }`}
          style={mode === "focus" ? { width: focusW } : undefined}
        >
          {/* Header = drag handle */}
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            className="flex items-center justify-between px-2.5 h-9 cursor-grab active:cursor-grabbing border-b border-border/60 touch-none"
          >
            <span className="text-[11px] font-mono text-muted-foreground">
              {count} in call · {duration}
              {share ? " · sharing" : ""}
            </span>
            <span className="flex items-center gap-1">
              {mode === "preview" ? (
                <button
                  onClick={() => setMode("focus")}
                  aria-label="Open focus mode"
                  title="Focus mode"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={share ? minimizeShare : () => setMode("preview")}
                  aria-label="Minimize call"
                  title="Minimize"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setMode("minimal")}
                aria-label="Collapse call to status pill"
                title="Collapse to pill"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          </div>

          {/* Body */}
          <div className="p-2 flex flex-col gap-2">
            {mode === "focus" && share ? (
              <>
                <div className="relative rounded-xl overflow-hidden bg-black/60 border border-glass-border/40 aspect-video">
                  <ParticipantTile
                    trackRef={share}
                    className="h-full w-full [&_video]:object-contain"
                  />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
                    {displayName(share.participant.identity, share.participant.name)}’s screen
                  </span>
                </div>
                <div className="flex gap-2">
                  {camTracks.slice(0, 4).map((t) => (
                    <div key={t.participant.identity} className="flex-1 min-w-0">
                      <CamTile
                        trackRef={t}
                        size="sm"
                        speaking={isSpeaking(t.participant.identity)}
                        mirrored={t.participant.isLocal}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {heroTrack && (
                  <CamTile
                    trackRef={heroTrack}
                    size={mode === "focus" ? "lg" : "md"}
                    speaking={isSpeaking(heroTrack.participant.identity)}
                    mirrored={heroTrack.participant.isLocal}
                  />
                )}
                {stripTracks.length > 0 && (
                  <div className="flex gap-2">
                    {stripTracks.slice(0, 2).map((t) => (
                      <div key={t.participant.identity} className="flex-1 min-w-0">
                        <CamTile
                          trackRef={t}
                          size="sm"
                          speaking={isSpeaking(t.participant.identity)}
                          mirrored={t.participant.isLocal}
                        />
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div
                        title={`${overflow} more in call (audio only shown)`}
                        className="flex-1 min-w-0 h-12 rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground"
                      >
                        +{overflow}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Controls — always mounted, revealed on hover */}
            <div className="flex items-center justify-center gap-2 pt-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-opacity hover:opacity-100 focus-within:opacity-100">
              <TrackToggle
                source={Track.Source.Microphone}
                showIcon
                className={controlBtn}
              />
              <TrackToggle
                source={Track.Source.Camera}
                showIcon
                className={controlBtn}
              />
              <TrackToggle
                source={Track.Source.ScreenShare}
                showIcon
                className={controlBtn}
              />
              <DisconnectButton className="flex items-center justify-center w-11 h-11 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4">
                <PhoneOff />
              </DisconnectButton>
            </div>
          </div>
        </div>
      )}

      <RoomAudioRenderer />
    </div>
  );
}

export function VideoCall({
  roomId,
  identity,
  name,
  onLeave,
  onStatus,
}: VideoCallProps) {
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
      <div className="fixed left-6 bottom-6 z-[90] glass-panel rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
        <span>Call failed: {error}</span>
        <button
          onClick={onLeave}
          aria-label="Close call error"
          className="px-3 min-h-[44px] rounded-md bg-secondary border border-border text-foreground cursor-pointer"
        >
          Close
        </button>
      </div>
    );
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
        <CallLayerInner onLeave={onLeave} onStatus={onStatus} />
      </LiveKitRoom>
    </div>
  );
}
