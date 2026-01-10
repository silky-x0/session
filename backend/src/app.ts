import express from "express";
import cors from "cors";
import { createAiSession } from "./controllers/aiController";
import { config } from "./config/env";

const app = express();


const corsOrigin = process.env.NODE_ENV === 'production' 
  ? (config.frontendUrl || 'https://mock-collab-editor.onrender.com')
  : '*';  

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: process.env.NODE_ENV === 'production' // Enable credentials only in production
}));
app.use(express.json());


const apiRouter = express.Router();
apiRouter.post("/ai/session", createAiSession);

app.use("/api", apiRouter);

export default app;
