import express from "express";
import cors from "cors";
import { createAiSession } from "./controllers/aiController";
import { config } from "./config/env";

const app = express();

app.use(cors({
  origin: [config.frontendUrl || 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Routes
// We can move this to a separate routes file, but for now this is clean enough
const apiRouter = express.Router();
apiRouter.post("/ai/session", createAiSession);

app.use("/api", apiRouter);

export default app;
