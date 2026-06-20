"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.liveblocks = void 0;
const node_1 = require("@liveblocks/node");
const env_1 = require("./env");
exports.liveblocks = new node_1.Liveblocks({
    secret: env_1.config.liveBlockSecretKey,
});
