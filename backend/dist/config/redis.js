"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
exports.redisConnection = new ioredis_1.default(env_1.config.REDIS_URL, {
    maxRetriesPerRequest: null,
});
exports.redisConnection.on("ready", () => {
    console.log("Successfully connected to Redis Cloud");
});
exports.redisConnection.on("error", (err) => {
    console.error(" Redis connection error:", err.message);
});
