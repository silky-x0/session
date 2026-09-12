import {
  scheduleRoomDeletion,
  closeRoomDeletionQueue,
} from "./src/queues/roomDeletion.queue";

async function runTest() {
  console.log("Scheduling deletion for 'test-room-123' in 5 seconds...");

  // Schedule it to run 5 seconds from now
  await scheduleRoomDeletion("3cd4c36e", 5000);

  console.log("Job added to Redis! Switch over to your backend terminal and watch the worker pick it up in 5s...");

  // Give the queue client a moment to flush, then close cleanly so this
  // script can exit. (Don't quit the shared app connection — the queue
  // owns a dedicated connection closed via closeRoomDeletionQueue.)
  setTimeout(() => {
    closeRoomDeletionQueue()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }, 1000);
}

runTest();
