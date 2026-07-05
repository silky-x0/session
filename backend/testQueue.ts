import { scheduleRoomDeletion } from "./src/queues/roomDeletion.queue";
import { redisConnection } from "./src/config/redis";

async function runTest() {
  console.log("Scheduling deletion for 'test-room-123' in 5 seconds...");
  
  // Schedule it to run 5 seconds from now
  await scheduleRoomDeletion("3cd4c36e", 5000);
  
  console.log("Job added to Redis! Switch over to your backend terminal and watch the worker pick it up in 5s...");
  
  // Disconnect so this script can exit cleanly
  setTimeout(() => {
    redisConnection.quit();
  }, 1000);
}

runTest();
