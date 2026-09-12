import { Queue } from "bullmq";
import {
  createRedisConnection,
  withRedisTimeout,
  REDIS_OP_TIMEOUT_MS,
} from "../config/redis";

// Dedicated connection for the queue client — never share BullMQ
// connections between Queue / Worker / general-purpose commands.
const queueConnection = createRedisConnection("room-deletion-queue");

queueConnection.on("error", (err) => {
  console.error(`[room-deletion queue] Redis error: ${err.message}`);
});

export const roomDeletionQueue = new Queue("room-deletion", {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export async function scheduleRoomDeletion(
  roomId: string,
  delayMs: number,
): Promise<void> {
  try {
    await withRedisTimeout(
      roomDeletionQueue.remove(roomId),
      REDIS_OP_TIMEOUT_MS,
      `cancel stale deletion for ${roomId}`,
    );
  } catch (err) {
    console.error(
      `[room-deletion] Could not clear stale job for ${roomId}:`,
      err instanceof Error ? err.message : err,
    );
  }

  try {
    await withRedisTimeout(
      roomDeletionQueue.add(
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
      ),
      REDIS_OP_TIMEOUT_MS,
      `schedule deletion for ${roomId}`,
    );
    console.log(
      `[room-deletion] Scheduled deletion for room ${roomId} in ${delayMs}ms`,
    );
  } catch (err) {

    const message = err instanceof Error ? err.message : String(err);
    if (/duplicate|already exists|JobExists/i.test(message)) {
      console.log(
        `[room-deletion] Deletion for room ${roomId} is already scheduled`,
      );
      return;
    }
    console.error(
      `[room-deletion] FAILED to schedule deletion for room ${roomId}:`,
      message,
    );
  }
}

export async function cancelRoomDeletion(roomId: string): Promise<void> {
  try {
    const removed = await withRedisTimeout(
      roomDeletionQueue.remove(roomId),
      REDIS_OP_TIMEOUT_MS,
      `cancel deletion for ${roomId}`,
    );

    if (removed) {
      console.log(`[room-deletion] No pending deletion remains for ${roomId}`);
    }
  } catch (err) {
    console.error(
      `[room-deletion] Could not cancel deletion for ${roomId}:`,
      err instanceof Error ? err.message : err,
    );
  }
}

export async function closeRoomDeletionQueue(): Promise<void> {
  await roomDeletionQueue.close();
  queueConnection.disconnect();
}
