import { Request, Response, NextFunction } from "express";
import { redisConnection } from "../config/redis";

interface TokenBucketOptions {
  keyPrefix: string;
  capacity: number;
  refillTimeMs: number; 
  errorMessage: string;
  useCompoundKey?: boolean; // If true, rate limit by IP + Room ID
}


const createTokenBucketLimiter = (options: TokenBucketOptions) => {
  const { keyPrefix, capacity, refillTimeMs, errorMessage, useCompoundKey } = options;
  const refillRate = capacity / refillTimeMs; 

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
    
    let redisKey = `ratelimit:${keyPrefix}:${ip}`;

    // If compound key is enabled, resolve the Room ID
    if (useCompoundKey) {
      let roomId = req.body?.roomId || req.query?.room || req.headers["x-room-id"] || "";

      // Fallback: Attempt to extract room parameter from the HTTP Referer header
      if (!roomId && req.headers.referer) {
        try {
          const refererUrl = new URL(req.headers.referer);
          roomId = refererUrl.searchParams.get("room") || "";
        } catch {}
      }

      if (roomId) {
        redisKey = `ratelimit:${keyPrefix}:${ip}:${roomId}`;
      }
    }

    const now = Date.now();

    try {
     
      const rawData = await redisConnection.hgetall(redisKey);
      
      let tokens = capacity;
      let lastRefill = now;

      if (rawData && rawData.tokens && rawData.lastRefill) {
        const oldTokens = parseFloat(rawData.tokens);
        const oldLastRefill = parseInt(rawData.lastRefill, 10);
        
      
        const elapsed = now - oldLastRefill;
        const refilled = elapsed * refillRate;
        
        tokens = Math.min(capacity, oldTokens + refilled);
        lastRefill = now;
      }

   
      if (tokens >= 1) {
        tokens = tokens - 1;

        await redisConnection.multi()
          .hset(redisKey, {
            tokens: tokens.toString(),
            lastRefill: lastRefill.toString(),
          })
          .pexpire(redisKey, refillTimeMs)
          .exec();

        res.setHeader("RateLimit-Limit", capacity);
        res.setHeader("RateLimit-Remaining", Math.floor(tokens));
        res.setHeader("RateLimit-Reset", Math.ceil((capacity - tokens) / refillRate / 1000));

        next();
      } else {
        const waitMs = Math.ceil((1 - tokens) / refillRate);
        res.setHeader("Retry-After", Math.ceil(waitMs / 1000));
        res.setHeader("RateLimit-Limit", capacity);
        res.setHeader("RateLimit-Remaining", 0);
        res.setHeader("RateLimit-Reset", Math.ceil(waitMs / 1000));

        res.status(429).json({ error: errorMessage });
      }
    } catch (error) {
      // Fallback: If Redis is unavailable, log the error and fail open to prevent blocking legitimate traffic
      console.error(`Rate Limiter error [${keyPrefix}]:`, error);
      next();
    }
  };
};

// DUAL KEY LIMITERS FOR CODE EXECUTION

// 1. Room-Specific Code Execution: Max 5 runs/min per IP + Room
export const roomCodeExecutionLimiter = createTokenBucketLimiter({
  keyPrefix: "room-code-exec",
  capacity: 5,
  refillTimeMs: 60 * 1000,
  useCompoundKey: true,
  errorMessage: "Too many code execution requests in this room. Please wait.",
});

// 2. Global IP Code Execution: Max 30 runs/min per IP across all rooms
export const globalIpCodeExecutionLimiter = createTokenBucketLimiter({
  keyPrefix: "global-ip-code-exec",
  capacity: 30,
  refillTimeMs: 60 * 1000,
  useCompoundKey: false,
  errorMessage: "High volume of code execution from your network. Please wait.",
});

// DUAL KEY LIMITERS FOR AI SERVICES 

// 1. Room-Specific AI Limit: Max 10 requests/min per IP + Room
export const roomAiServiceLimiter = createTokenBucketLimiter({
  keyPrefix: "room-ai-service",
  capacity: 10,
  refillTimeMs: 60 * 1000,
  useCompoundKey: true,
  errorMessage: "Too many AI requests in this room. Please wait a moment.",
});

// 2. Global IP AI Limit: Max 50 requests/min per IP across all rooms
export const globalIpAiServiceLimiter = createTokenBucketLimiter({
  keyPrefix: "global-ip-ai-service",
  capacity: 50,
  refillTimeMs: 60 * 1000,
  useCompoundKey: false,
  errorMessage: "High volume of AI requests from your network. Please wait.",
});

// Baseline rate limiter: Max 100 requests per 15 minutes per IP
export const globalApiLimiter = createTokenBucketLimiter({
  keyPrefix: "global-api",
  capacity: 100,
  refillTimeMs: 15 * 60 * 1000,
  useCompoundKey: false,
  errorMessage: "Too many requests to the server. Please try again later.",
});
