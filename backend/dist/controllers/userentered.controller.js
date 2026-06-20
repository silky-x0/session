"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUserEntered = void 0;
const roomDeletion_queue_1 = require("../queues/roomDeletion.queue");
const handleUserEntered = async (event) => {
    const { roomId, numActiveUsers } = event.data;
    if (numActiveUsers === 1) {
        await (0, roomDeletion_queue_1.cancelRoomDeletion)(roomId);
        //add log
    }
};
exports.handleUserEntered = handleUserEntered;
