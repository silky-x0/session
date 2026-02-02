import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import aiRoutes from "./routes/ai.routes";

const app = express();

app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: config.cors.credentials,
}));
app.use(express.json());

app.use("/api/ai", aiRoutes);

app.use(errorHandler);

export default app;
