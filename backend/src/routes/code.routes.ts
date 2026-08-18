import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { executeCode } from "../controllers/execute.controller";
import {
  globalIpCodeExecutionLimiter,
  roomCodeExecutionLimiter,
} from "../middleware/rateLimiter";

const router = Router();

router.post(
  "/execute",
  globalIpCodeExecutionLimiter,
  roomCodeExecutionLimiter,
  asyncHandler(executeCode),
);

export default router;
