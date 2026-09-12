import { Worker } from "bullmq";
import { createRedisConnection } from "../config/redis";
import { liveblocks } from "../config/liveblock";

// Dedicated connection for the worker — BullMQ internally duplicates this
// into a blocking connection, so it must not be shared with the Queue
// client or with general-purpose commands (rate limiter).
const workerConnection = createRedisConnection("room-deletion-worker");

function isNotFound(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    (err as { status?: unknown }).status === 404
  );
}

const roomDeletionWorker = new Worker(
  "room-deletion",
  async (job) => {
    const { roomId } = job.data as { roomId: string };

    console.log(`[Worker] Picked up job to delete room: ${roomId}`);

    let activeUsers: { data: unknown[] };
    try {
      activeUsers = await liveblocks.getActiveUsers(roomId);
    } catch (err: unknown) {
      if (isNotFound(err)) {
        // Room is already gone — nothing to do, don't retry.
        console.log(`[Worker] Room ${roomId} no longer exists, skipping`);
        return;
      }
      console.error(
        `[Worker] Error checking active users for ${roomId}:`,
        err instanceof Error ? err.message : err,
      );
      throw err; // re-throw so BullMQ retries
    }

    if (activeUsers.data.length > 0) {
      console.log(
        `[Worker] Deletion aborted for ${roomId} — active users found!`,
      );
      return;
    }

    try {
      await liveblocks.deleteRoom(roomId);
      console.log(`[Worker] Successfully deleted room: ${roomId}`);
    } catch (err: unknown) {
      if (isNotFound(err)) {
        // Deleted between the check and now (or by another path) — success.
        console.log(`[Worker] Room ${roomId} was already deleted`);
        return;
      }
      console.error(
        `[Worker] Error deleting room ${roomId}:`,
        err instanceof Error ? err.message : err,
      );
      throw err; // re-throw so BullMQ retries
    }
  },
  {
    connection: workerConnection,
    concurrency: 5,
  },
);

roomDeletionWorker.on("ready", () => {
  console.log("[Worker] room-deletion worker is listening for jobs");
});

roomDeletionWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed`);
});

roomDeletionWorker.on("failed", (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err.message);
});

roomDeletionWorker.on("stalled", (jobId) => {
  console.warn(`[Worker] Job ${jobId} stalled and will be retried`);
});

roomDeletionWorker.on("error", (err) => {
  console.error("[Worker] room-deletion worker error:", err.message);
});

export async function closeRoomDeletionWorker(): Promise<void> {
  await roomDeletionWorker.close();
  workerConnection.disconnect();
}

export default roomDeletionWorker;
