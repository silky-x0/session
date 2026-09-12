import { scheduleRoomDeletion } from "../queues/roomDeletion.queue";
import { UserLeftEvent } from "@liveblocks/node";



export const handleUserLeft = async (
  event: UserLeftEvent,
): Promise<void> => {

  const { roomId, numActiveUsers } = event.data;

  if (numActiveUsers === 0) {
    try {
      await scheduleRoomDeletion(roomId, 15 * 60 * 1000);
    } catch (err) {
      // Fail open: never break the Liveblocks webhook because Redis is down.
      console.error(
        `[userLeft] Could not schedule deletion for ${roomId}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
  //we'll add logging service later later
};
