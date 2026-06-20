"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const liveblock_1 = require("../config/liveblock");
const roomDeletionWorker = new bullmq_1.Worker("room-deletion", async (job) => {
    const { roomId } = job.data;
    console.log(`[Worker] Picked up job to delete room: ${roomId}`);
    const activeUsers = await liveblock_1.liveblocks.getActiveUsers(roomId);
    if (activeUsers.data.length > 0) {
        console.log(`[Worker] Deletion aborted for ${roomId} — active users found!`);
        return;
    }
    try {
        await liveblock_1.liveblocks.deleteRoom(roomId);
        console.log(`[Worker] Successfully deleted room: ${roomId}`);
    }
    catch (err) {
        console.error(`[Worker] Error deleting room ${roomId}:`, err.message);
        throw err; // re-throw so bullmq retries
    }
}, {
    connection: redis_1.redisConnection,
});
exports.default = roomDeletionWorker;
