import { Worker } from "bullmq";
import { redisConnection } from "../config/redis";
import { liveblocks } from "../config/liveblock";


const roomDeletionWorker = new Worker(
  "room-deletion",
  async (job) => {
    const { roomId } = job.data;

    const activeUsers = await liveblocks.getActiveUsers(roomId);

    if (activeUsers.data.length > 0) {
        //log deletion aborted
        return;
    }

    try {
      await liveblocks.deleteRoom(roomId);
      //log deletion successfull
    } catch(err) {
      //log error
      throw err // re-throw so bullmq retries
    }

  },
  {
    connection: redisConnection,
  },
);

export default roomDeletionWorker;
