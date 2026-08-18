import { Request, Response, NextFunction } from "express";
import { redisConnection } from "../config/redis";

interface TokenBucketOptions {
  keyPrefix: string;
  capacity: number;
  refillTimeMs: number; 
  errorMessage: string;
}


const createTokenBucketLimiter = (options: TokenBucketOptions) => {
  const { keyPrefix, capacity, refillTimeMs, errorMessage } = options;
  const refillRate = capacity / refillTimeMs;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
    const redisKey = `ratelimit:${keyPrefix}:${ip}`;
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
     // if redis aint available
      console.error(`Rate Limiter error [${keyPrefix}]:`, error);
      next();
    }
  };
};

// Strict Limiter for Code Execution: Max 5 executions, refilled over 1 minute (1 token per 12 seconds)
export const codeExecutionLimiter = createTokenBucketLimiter({
  keyPrefix: "code-exec",
  capacity: 5,
  refillTimeMs: 60 * 1000,
  errorMessage: "Too many code execution requests. Please wait before executing again.",
});

// Moderate Limiter for AI Chat & Session Generation: Max 10 requests, refilled over 1 minute (1 token per 6 seconds)
export const aiServiceLimiter = createTokenBucketLimiter({
  keyPrefix: "ai-service",
  capacity: 10,
  refillTimeMs: 60 * 1000,
  errorMessage: "Too many AI requests. Please wait a moment before sending another message.",
});

// Global baseline rate limiter: Max 100 requests, refilled over 15 minutes
export const globalApiLimiter = createTokenBucketLimiter({
  keyPrefix: "global-api",
  capacity: 100,
  refillTimeMs: 15 * 60 * 1000,
  errorMessage: "Too many requests to the server. Please try again later.",
});
