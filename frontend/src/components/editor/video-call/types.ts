export interface CallStatus {
  count: number;
  speakingName: string | null;
  muted: boolean;
}

export interface VideoCallProps {
  roomId: string;
  identity: string;
  name: string;
  onLeave: () => void;
  onStatus?: (s: CallStatus) => void;
}

export type CallMode = "minimal" | "preview" | "focus";
