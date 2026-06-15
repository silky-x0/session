import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export const roomDeletionQueue = new Queue("room-deletion", {
  connection: redisConnection,
});

export async function scheduleRoomDeletion(
  roomId: string,
  delayMs: number,
): Promise<void> {
  await roomDeletionQueue.add(
    roomId,
    { roomId },
    {
      jobId: roomId,
      delay: delayMs,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );
}

export async function cancelRoomDeletion(roomId: string): Promise<void> {
  await roomDeletionQueue.remove(roomId);
}

