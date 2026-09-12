import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { globalApiLimiter } from "./middleware/rateLimiter";
import { isRedisReady, redisConnection } from "./config/redis";
import aiRoutes from "./routes/ai.routes";
import codeRoutes from "./routes/code.routes";
import sessionRoutes from "./routes/session.routes";
import livekitRoutes from "./routes/livekit.routes";
import webhookRoutes from "./routes/webhook.routes";
const app = express();

app.use(
  cors({
    origin: config.cors.origin,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: config.cors.credentials,
  }),
);

app.use("/webhook", express.raw({ type: "application/json" }), webhookRoutes);

// Global body cap (individual fields have stricter limits (see utils/payloadLimits))
app.use(express.json({ limit: "512kb" }));

app.use("/api", globalApiLimiter);

app.use("/api/sessions", sessionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/livekit", livekitRoutes);


// Always 200 so orchestrator health checks don't restart the app when
// Redis blips — check the `redis.ready` field to verify connectivity.
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    redis: { status: redisConnection.status, ready: isRedisReady() },
  });
});
app.use(errorHandler);

export default app;
