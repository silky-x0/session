"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLiveblocksWebhook = void 0;
const node_1 = require("@liveblocks/node");
const env_1 = require("../config/env");
const webhookHandler = new node_1.WebhookHandler(env_1.config.liveBlocksWebhookSecret);
const verifyLiveblocksWebhook = (req, res, next) => {
    try {
        const event = webhookHandler.verifyRequest({
            headers: req.headers,
            rawBody: req.body.toString(),
        });
        req.liveblocks = event;
        next();
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Invalid webhook' });
    }
};
exports.verifyLiveblocksWebhook = verifyLiveblocksWebhook;
