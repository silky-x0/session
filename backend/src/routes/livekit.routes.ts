import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { validateSessionToken } from "../middleware/auth";
import { issueLivekitToken } from "../controllers/livekit.controller";

const router = Router();

// Protected: requires room session token, room-bound
router.post("/token", validateSessionToken, asyncHandler(issueLivekitToken));

export default router;
