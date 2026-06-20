"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebhook = void 0;
const userleft_controller_1 = require("./userleft.controller");
const userentered_controller_1 = require("./userentered.controller");
const handleWebhook = async (req, res) => {
    const event = req.liveblocks;
    if (event.type === "userLeft") {
        await (0, userleft_controller_1.handleUserLeft)(event);
    }
    else if (event.type === "userEntered") {
        await (0, userentered_controller_1.handleUserEntered)(event);
    }
    res.status(200).send("OK");
};
exports.handleWebhook = handleWebhook;
