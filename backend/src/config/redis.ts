import IORedis from "ioredis";
import { config } from "./env";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("ready", () => {
  console.log("Successfully connected to Redis Cloud");
});

redisConnection.on("error", (err) => {
  console.error(" Redis connection error:", err.message);
});
