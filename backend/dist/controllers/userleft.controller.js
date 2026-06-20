"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserLeft = void 0;
const roomDeletion_queue_1 = require("../queues/roomDeletion.queue");
const handleUserLeft = async (event) => {
    const { roomId, numActiveUsers } = event.data;
    if (numActiveUsers === 0) {
        await (0, roomDeletion_queue_1.scheduleRoomDeletion)(roomId, 15 * 60 * 1000);
    }
    //we'll add logging service later later
};
exports.handleUserLeft = handleUserLeft;
