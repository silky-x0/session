import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { liveblocks } from "../config/liveblock";


const roomDeletionWorker = new Worker(
  "room-deletion",
  async (job) => {
    const { roomId } = job.data;

    console.log(`[Worker] Picked up job to delete room: ${roomId}`);
    const activeUsers = await liveblocks.getActiveUsers(roomId);

    if (activeUsers.data.length > 0) {
        console.log(`[Worker] Deletion aborted for ${roomId} — active users found!`);
        return;
    }

    try {
      await liveblocks.deleteRoom(roomId);
      console.log(`[Worker] Successfully deleted room: ${roomId}`);
    } catch(err: any) {
      console.error(`[Worker] Error deleting room ${roomId}:`, err.message);
      throw err // re-throw so bullmq retries
    }

  },
  {
    connection: redisConnection,
  },
);

export default roomDeletionWorker;
