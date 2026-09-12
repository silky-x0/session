import IORedis from "ioredis";
import { config } from "./env";

const REDIS_URL = config.REDIS_URL;

export const REDIS_OP_TIMEOUT_MS = 5000;

function redactUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = "***";
    return parsed.toString();
  } catch {
    return "<invalid REDIS_URL>";
  }
}

const isTlsUrl = REDIS_URL.toLowerCase().startsWith("rediss://");

if (!process.env.REDIS_URL) {
  console.warn(
    "[Redis] REDIS_URL is not set — falling back to redis://localhost:6379. " +
      "Room cleanup and rate limiting will NOT work against Redis Cloud. " +
      "Set REDIS_URL in production (Render dashboard → Environment).",
  );
} else {
  console.log(
    `[Redis] Connecting to ${redactUrl(REDIS_URL)}${isTlsUrl ? " (TLS)" : ""}`,
  );
}

function describeError(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    Array.isArray((err as { errors?: unknown }).errors)
  ) {
    return (err as { errors: unknown[] }).errors
      .map((e) => describeError(e))
      .join("; ");
  }
  if (err instanceof Error) {
    const code = (err as NodeJS.ErrnoException).code;
    return code ? `${err.message} (code=${code})` : err.message;
  }
  return String(err);
}

function attachLifecycleLogs(client: IORedis, name: string): void {
  client.on("ready", () => {
    console.log(`[Redis:${name}] ready — connected to Redis Cloud`);
  });
  client.on("error", (err) => {
    console.error(`[Redis:${name}] connection error: ${describeError(err)}`);
  });
  client.on("close", () => {
    console.warn(`[Redis:${name}] connection closed — retrying…`);
  });
  client.on("reconnecting", () => {
    console.warn(`[Redis:${name}] reconnecting… (status=${client.status})`);
  });
  client.on("end", () => {
    console.warn(`[Redis:${name}] connection ended`);
  });
}


export function createRedisConnection(name: string): IORedis {
  const client = new IORedis(REDIS_URL, {

    maxRetriesPerRequest: null,
    connectTimeout: 10_000,

    ...(isTlsUrl ? { tls: {} } : {}),
    retryStrategy: (times) => {
  
      const delayMs = Math.min(times * 200, 5000);
      if (times <= 3 || times % 10 === 0) {
        console.warn(
          `[Redis:${name}] reconnect attempt #${times} in ${delayMs}ms (status=${client.status})`,
        );
      }
      return delayMs;
    },
    connectionName: `backend:${name}:pid-${process.pid}`,
  });

  attachLifecycleLogs(client, name);
  return client;
}


export const redisConnection = createRedisConnection("app");

export function isRedisReady(client: IORedis = redisConnection): boolean {
  return client.status === "ready";
}

export function withRedisTimeout<T>(
  promise: Promise<T>,
  ms: number = REDIS_OP_TIMEOUT_MS,
  op = "redis op",
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${op} timed out after ${ms}ms`)),
      ms,
    );
    timer.unref?.();
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
