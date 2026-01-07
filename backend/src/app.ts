import express from "express";
import cors from "cors";
import { createAiSession } from "./controllers/aiController";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
// We can move this to a separate routes file, but for now this is clean enough
const apiRouter = express.Router();
apiRouter.post("/ai/session", createAiSession);

app.use("/api", apiRouter);

export default app;
