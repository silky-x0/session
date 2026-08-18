import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { executeCode } from "../controllers/execute.controller";
import { codeExecutionLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/execute", codeExecutionLimiter, asyncHandler(executeCode));

export default router;
