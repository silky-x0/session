declare global {
  interface Liveblocks {

    Presence: {
      cursor: { elementId: string; anchorX: "left" | "right"; x: number; y: number } | null;
      isTyping: boolean;
      selectedLineNumber: number | null;
      hoveredPanel: "editor" | "whiteboard" | "chat" | "output" | "problem" | null;
      info?: {
        name: string;
        color: string;
        avatarSeed?: string;
      };
    };
    
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
        avatar?: string;
        avatarSeed?: string;
      };
    };

    // ─── Broadcast Events ───────────────────────────────────────
    // Custom events sent between clients via useBroadcastEvent
    RoomEvent:
      | { type: "ATTENTION_PING"; lineNumber: number; fromUser: string }
      | { type: "REACTION"; emoji: string; fromUser: string }
      | {
          type: "SYSTEM";
          message: string;
          severity: "info" | "warning" | "error";
        }
      | {
          type: "WHITEBOARD_DRAW";
          x0: number;
          y0: number;
          x1: number;
          y1: number;
          color: string;
          lineWidth: number;
        }
      | { type: "WHITEBOARD_CLEAR" };


    // ─── Thread Metadata ────────────────────────────────────────
    ThreadMetadata: {
      lineNumber: number;
      fileName: string;
      resolved: boolean;
    };

    // ─── Room Info ──────────────────────────────────────────────
    RoomInfo: {
      title: string;
      url: string;
    };

    // ─── Group Info ─────────────────────────────────────────────
    GroupInfo: {
      name: string;
    };

    // ─── Custom Notification Activities ─────────────────────────
    ActivitiesData: {
      $codeExecution: {
        status: "success" | "error";
        language: string;
      };
      $userJoined: {
        userName: string;
      };
    };
  }
}

export {};
