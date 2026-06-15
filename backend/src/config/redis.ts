import IORedis from "ioredis";
import { config } from "./env";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});
