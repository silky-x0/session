/**
 * useRoomSettings — placeholder hook for Liveblocks Storage.
 *
 * This project uses Yjs (Y.Doc, Y.Map, Y.Text) for state management,
 * synced through LiveblocksYjsProvider. Liveblocks Storage (useStorage/useMutation)
 * is an alternative approach that is NOT used here.
 *
 * This file is kept as a reference implementation. To use it, you'd need to:
 * 1. Define a Storage type in liveblocks.config.ts
 * 2. Pass initialStorage to RoomProvider in Editor.tsx
 * 3. Remove the Yjs-based metadata sync (yMeta) from Editor.tsx
 *
 * For now, the editor syncs room settings through yDoc.getMap("meta").
 */

export {};
