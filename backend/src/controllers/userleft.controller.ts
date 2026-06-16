import { scheduleRoomDeletion } from "../queues/roomDeletion.queue";
import { UserLeftEvent } from "@liveblocks/node";



export const handleUserLeft = async (
  event: UserLeftEvent,
): Promise<void> => {

  const { roomId, numActiveUsers } = event.data;

  if (numActiveUsers === 0) {
    await scheduleRoomDeletion(roomId, 15 * 60 * 1000);
  } 
  //we'll add logging service later later
};
