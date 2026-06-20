"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomDeletionQueue = void 0;
exports.scheduleRoomDeletion = scheduleRoomDeletion;
exports.cancelRoomDeletion = cancelRoomDeletion;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.roomDeletionQueue = new bullmq_1.Queue("room-deletion", {
    connection: redis_1.redisConnection,
});
async function scheduleRoomDeletion(roomId, delayMs) {
    await exports.roomDeletionQueue.add(roomId, { roomId }, {
        jobId: roomId,
        delay: delayMs,
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
    });
}
async function cancelRoomDeletion(roomId) {
    await exports.roomDeletionQueue.remove(roomId);
}
