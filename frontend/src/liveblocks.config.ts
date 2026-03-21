// Liveblocks v3 — hooks are imported directly from @liveblocks/react/suspense
// No need for createRoomContext; LiveblocksProvider + RoomProvider handles everything.
//
// Usage:
//   import { useRoom, useSelf, useOthers } from "@liveblocks/react/suspense";
//
// This file exists as a central place for Liveblocks type declarations.
// Extend these types as you add features (cursors, avatars, etc.)

declare global {
  interface Liveblocks {
    // Presence — cursor position for live cursors
    Presence: {
      cursor: { x: number; y: number } | null;
    };

    // User metadata attached to each connection
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
      };
    };

    // Room event payloads (for useBroadcastEvent / useEventListener)
    RoomEvent: {};
  }
}

export {};
