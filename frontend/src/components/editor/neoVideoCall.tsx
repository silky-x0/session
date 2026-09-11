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
  Pin,
  PinOff,
  Expand,
  Shrink,
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

/** Camera tile with speaking ring, name label, mic badge, and pin action. */
function CamTile({
  trackRef,
  speaking,
  mirrored,
  size,
  isPinned,
  onTogglePin,
}: {
  trackRef: TrackReferenceOrPlaceholder;
  speaking: boolean;
  mirrored?: boolean;
  size: "sm" | "md" | "lg" | "grid";
  isPinned?: boolean;
  onTogglePin?: () => void;
}) {
  const p = trackRef.participant;
  const label = displayName(p.identity, p.name);
  const micOff = !p.isMicrophoneEnabled;
  const h = "w-full aspect-video";

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
      <span className="absolute bottom-1 left-1.5 max-w-[80%] truncate text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1 z-10">
        {isPinned && <Pin className="w-2.5 h-2.5 text-primary fill-primary shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
      {onTogglePin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          title={isPinned ? "Unpin participant" : "Pin participant"}
          aria-label={isPinned ? "Unpin participant" : "Pin participant"}
          className={`absolute top-1 left-1 p-1 rounded-full backdrop-blur-md transition-all cursor-pointer z-20 ${
            isPinned
              ? "bg-primary text-background opacity-100 shadow-md"
              : "bg-black/60 text-white/80 opacity-0 group-hover/tile:opacity-100 hover:text-white hover:bg-black/80"
          }`}
        >
          {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
        </button>
      )}
      {micOff && (
        <span className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-red-400 z-10">
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
  const dragRef = useRef<{ dx: number; dy: number; sx: number; sy: number; th: number } | null>(null);
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
      // Fingers jitter more than mice — bigger tap-vs-drag threshold.
      th: e.pointerType === "touch" ? 12 : 6,
    };
    suppressClickRef.current = false;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onDragMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > d.th) {
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

  // Re-clamp whenever box size changes (mode switch, camera turn on/off, video load).
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      setPos((p) => {
        if (!p) return p;
        const c = clampPos(p.x, p.y);
        return c.x === p.x && c.y === p.y ? p : c;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [clampPos, mode]);

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

  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Auto reset pin when pinned participant disconnects
  useEffect(() => {
    if (pinnedIdentity && !camTracks.some((t) => t.participant.identity === pinnedIdentity)) {
      setPinnedIdentity(null);
    }
  }, [camTracks, pinnedIdentity]);

  const togglePin = useCallback((identity: string) => {
    setPinnedIdentity((current) => (current === identity ? null : identity));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (next) {
        if (boxRef.current?.requestFullscreen) {
          boxRef.current.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  const localCam = camTracks.find((t) => t.participant.isLocal) ?? null;
  const remoteCams = camTracks.filter((t) => !t.participant.isLocal);

  const pinnedTrack = pinnedIdentity
    ? camTracks.find((t) => t.participant.identity === pinnedIdentity) ?? null
    : null;

  const heroTrack = pinnedTrack ?? remoteCams[0] ?? localCam;
  const stripTracks = camTracks.filter((t) => t !== heroTrack);
  const overflow = Math.max(0, stripTracks.length - 3);

  const duration = formatDuration(now - (connectedAt.current || now));

  // Determine if focus mode should show balanced equal grid (2-4 participants, no pin/share)
  const isGridView = mode === "focus" && !share && !pinnedIdentity && camTracks.length >= 2;

  // Focus width computed in JS: fits viewport width AND height
  const focusW = Math.round(
    Math.min(680, vp.w - 32, Math.max(264, ((vp.h - 210) * 16) / 9)),
  );

  const controlBtn =
    "flex items-center justify-center w-11 h-11 rounded-full bg-secondary/80 border border-border text-foreground hover:bg-secondary transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 min-h-[44px] min-w-[44px]";

  // Dedicated full screen layout mode (mobile & desktop friendly)
  if (isFullscreen) {
    return (
      <div
        ref={boxRef}
        className="fixed inset-0 z-[9999] bg-black flex flex-col select-none overflow-hidden touch-none"
      >
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 h-12 bg-black/80 backdrop-blur-md border-b border-white/10 shrink-0 z-30">
          <span className="text-xs sm:text-sm font-mono text-white/90 truncate max-w-[65%]">
            {share
              ? `${displayName(share.participant.identity, share.participant.name)}’s Screen`
              : `${count} in call`}{" "}
            · {duration}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              aria-label="Exit full screen"
              title="Exit full screen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80 hover:bg-secondary text-white text-xs font-medium cursor-pointer min-h-[36px] border border-white/10"
            >
              <Shrink className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Exit Full Screen</span>
            </button>
            <button
              onClick={() => {
                toggleFullscreen();
                setMode("minimal");
              }}
              aria-label="Close full screen"
              title="Close full screen"
              className="p-2 rounded-lg bg-secondary/80 hover:bg-secondary text-white cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Fullscreen Display Area */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 sm:p-4 bg-black overflow-hidden">
          {share ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <ParticipantTile
                trackRef={share}
                className="h-full w-full max-h-full max-w-full [&_video]:object-contain [&_video]:max-h-full [&_video]:w-full"
              />
            </div>
          ) : (
            heroTrack && (
              <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
                <CamTile
                  trackRef={heroTrack}
                  size="lg"
                  speaking={isSpeaking(heroTrack.participant.identity)}
                  mirrored={heroTrack.participant.isLocal}
                  isPinned={pinnedIdentity === heroTrack.participant.identity}
                  onTogglePin={() => togglePin(heroTrack.participant.identity)}
                />
              </div>
            )
          )}
        </div>

        {/* Floating Participant Strip & Controls at Bottom */}
        <div className="p-2 flex items-center justify-between gap-2 bg-black/80 backdrop-blur-md border-t border-white/10 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {camTracks.map((t) => (
              <div key={t.participant.identity} className="w-20 sm:w-28 shrink-0">
                <CamTile
                  trackRef={t}
                  size="sm"
                  speaking={isSpeaking(t.participant.identity)}
                  mirrored={t.participant.isLocal}
                  isPinned={pinnedIdentity === t.participant.identity}
                  onTogglePin={() => togglePin(t.participant.identity)}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            <button
              onClick={toggleFullscreen}
              aria-label="Exit full screen"
              title="Exit full screen"
              className={controlBtn}
            >
              <Shrink className="w-4 h-4 text-primary" />
            </button>
            <DisconnectButton className="flex items-center justify-center w-11 h-11 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 min-h-[44px] min-w-[44px]">
              <PhoneOff />
            </DisconnectButton>
          </div>
        </div>

        <RoomAudioRenderer />
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      className="fixed z-[90] select-none"
      style={
        pos
          ? { left: pos.x, top: pos.y }
          : { left: vp.w < 640 ? 12 : 24, bottom: vp.w < 640 ? 12 : 24 }
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
          className="flex items-center gap-2 h-12 pl-2 pr-3 rounded-full glass-panel border border-glass-border/40 cursor-pointer hover:border-primary/40 transition-colors touch-none"
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
          className={`glass-panel rounded-2xl overflow-hidden border border-glass-border/40 flex flex-col ${
            mode === "focus" ? "max-h-[calc(100vh-16px)]" : "w-[264px]"
          }`}
          style={mode === "focus" ? { width: focusW } : undefined}
        >
          {/* Header = drag handle */}
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            className="flex items-center justify-between px-2.5 h-9 cursor-grab active:cursor-grabbing border-b border-border/60 touch-none shrink-0"
          >
            <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[65%]">
              {count} in call · {duration}
              {share ? " · sharing" : ""}
              {pinnedIdentity ? " · pinned" : ""}
            </span>
            <span className="flex items-center gap-1">
              <button
                onClick={toggleFullscreen}
                aria-label="Full screen"
                title="Full screen view"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              >
                <Expand className="w-3.5 h-3.5 text-primary" />
              </button>
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
          <div className="p-2 flex flex-col gap-2 overflow-y-auto min-h-0">
            {mode === "focus" && share ? (
              <>
                <div className="group/share relative rounded-xl overflow-hidden bg-black/60 border border-glass-border/40 aspect-video flex-1 min-h-0">
                  <ParticipantTile
                    trackRef={share}
                    className="h-full w-full [&_video]:object-contain"
                  />
                  <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md z-10">
                    {displayName(share.participant.identity, share.participant.name)}’s screen
                  </span>
                  <button
                    onClick={toggleFullscreen}
                    title="View screen share in full screen"
                    aria-label="View screen share in full screen"
                    className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 z-20 cursor-pointer border border-white/20 transition-all shadow-md active:scale-95 min-h-[36px]"
                  >
                    <Expand className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-semibold">Full Screen</span>
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {camTracks.map((t) => (
                    <div key={t.participant.identity} className="w-28 shrink-0">
                      <CamTile
                        trackRef={t}
                        size="sm"
                        speaking={isSpeaking(t.participant.identity)}
                        mirrored={t.participant.isLocal}
                        isPinned={pinnedIdentity === t.participant.identity}
                        onTogglePin={() => togglePin(t.participant.identity)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : isGridView ? (
              /* Balanced equal grid layout when 2-4 participants are in focus mode without a pin */
              <div
                className={`grid gap-2 ${
                  camTracks.length <= 2 ? "grid-cols-2" : "grid-cols-2"
                }`}
              >
                {camTracks.slice(0, 4).map((t) => (
                  <CamTile
                    key={t.participant.identity}
                    trackRef={t}
                    size="grid"
                    speaking={isSpeaking(t.participant.identity)}
                    mirrored={t.participant.isLocal}
                    isPinned={pinnedIdentity === t.participant.identity}
                    onTogglePin={() => togglePin(t.participant.identity)}
                  />
                ))}
                {camTracks.length > 4 && (
                  <div
                    title={`${camTracks.length - 4} more in call`}
                    className="aspect-video w-full rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-xs font-bold text-muted-foreground"
                  >
                    +{camTracks.length - 4} more
                  </div>
                )}
              </div>
            ) : (
              /* Single hero layout (1 person, or pinned participant, or preview mode) */
              <>
                {heroTrack && (
                  <CamTile
                    trackRef={heroTrack}
                    size={mode === "focus" ? "lg" : "md"}
                    speaking={isSpeaking(heroTrack.participant.identity)}
                    mirrored={heroTrack.participant.isLocal}
                    isPinned={pinnedIdentity === heroTrack.participant.identity}
                    onTogglePin={() => togglePin(heroTrack.participant.identity)}
                  />
                )}
                {stripTracks.length > 0 && (
                  <div className={`flex gap-2 ${mode === "preview" ? "" : "overflow-x-auto pb-1"}`}>
                    {stripTracks.slice(0, 3).map((t) => (
                      <div
                        key={t.participant.identity}
                        className={mode === "preview" ? "flex-1 min-w-0" : "w-28 shrink-0"}
                      >
                        <CamTile
                          trackRef={t}
                          size="sm"
                          speaking={isSpeaking(t.participant.identity)}
                          mirrored={t.participant.isLocal}
                          isPinned={pinnedIdentity === t.participant.identity}
                          onTogglePin={() => togglePin(t.participant.identity)}
                        />
                      </div>
                    ))}
                    {overflow > 0 && (
                      <div
                        title={`${overflow} more in call`}
                        className={
                          mode === "preview"
                            ? "flex-1 min-w-0 aspect-video rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground"
                            : "w-28 aspect-video shrink-0 rounded-xl bg-secondary/60 border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground"
                        }
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
              <DisconnectButton className="flex items-center justify-center w-11 h-11 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer [&_svg]:w-4 [&_svg]:h-4 min-h-[44px] min-w-[44px]">
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
