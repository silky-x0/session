import { ParticipantTile, type TrackReferenceOrPlaceholder } from "@livekit/components-react";
import { Expand } from "lucide-react";
import { displayName } from "../utils";

interface ScreenshareViewProps {
  share: TrackReferenceOrPlaceholder;
  onFullscreen: () => void;
}

/** Large screenshare stage used inside the floating focus window. */
export function ScreenshareView({ share, onFullscreen }: ScreenshareViewProps) {
  return (
    <div className="group/share relative rounded-xl overflow-hidden bg-black/60 border border-glass-border/40 aspect-video flex-1 min-h-0">
      <ParticipantTile
        trackRef={share}
        className="h-full w-full [&_video]:object-contain"
      />
      <span className="absolute bottom-1.5 left-2 text-[10px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md z-10">
        {displayName(share.participant.identity, share.participant.name)}’s
        screen
      </span>
      <button
        onClick={onFullscreen}
        title="View screen share in full screen"
        aria-label="View screen share in full screen"
        className="absolute top-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 z-20 cursor-pointer border border-white/20 transition shadow-md active:scale-95 min-h-[36px]"
      >
        <Expand className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-xs font-semibold">Full Screen</span>
      </button>
    </div>
  );
}
