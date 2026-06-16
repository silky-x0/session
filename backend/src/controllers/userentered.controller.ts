import { cancelRoomDeletion } from "../queues/roomDeletion.queue";
import { UserEnteredEvent } from "@liveblocks/node";


export const handleUserEntered = async (
  event: UserEnteredEvent
): Promise<void> => {
  const { roomId, numActiveUsers } = event.data;
  if (numActiveUsers === 1) {
    await cancelRoomDeletion(roomId);
    //add log
  }
};
