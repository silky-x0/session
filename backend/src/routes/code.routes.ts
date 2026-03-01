import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { executeCode } from "../controllers/execute.controller";

const router = Router();

router.post("/execute", asyncHandler(executeCode));

export default router;
