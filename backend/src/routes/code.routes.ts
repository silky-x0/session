import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateSessionToken } from "../middleware/auth";
import { executeCode } from "../controllers/execute.controller";
import {
  globalIpCodeExecutionLimiter,
  roomCodeExecutionLimiter,
} from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/execute",
  validateSessionToken,
  globalIpCodeExecutionLimiter,
  roomCodeExecutionLimiter,
  asyncHandler(executeCode),
);

export default router;
