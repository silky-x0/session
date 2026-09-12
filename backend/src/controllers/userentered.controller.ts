import { cancelRoomDeletion } from "../queues/roomDeletion.queue";
import { UserEnteredEvent } from "@liveblocks/node";


export const handleUserEntered = async (
  event: UserEnteredEvent
): Promise<void> => {
  const { roomId, numActiveUsers } = event.data;
  if (numActiveUsers === 1) {
    try {
      await cancelRoomDeletion(roomId);
    } catch (err) {
      // Fail open: never break the Liveblocks webhook because Redis is down.
      console.error(
        `[userEntered] Could not cancel deletion for ${roomId}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
};
