declare global {
  interface Liveblocks {
    // ─── Presence ───────────────────────────────────────────────
    // Temporary per-user data, resets on disconnect
    Presence: {
      cursor: { x: number; y: number } | null;
      isTyping: boolean;
      selectedLineNumber: number | null;
    };

    // ─── User Metadata ──────────────────────────────────────────
    // Set via authentication endpoint
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
        avatar?: string;
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
        };

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
