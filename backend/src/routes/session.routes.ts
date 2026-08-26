import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { issueRoomSessionToken } from "../controllers/sessionToken.controller";

const router = Router();

// Public endpoint: mints a room session token used by all protected routes
router.post("/:roomId/token", asyncHandler(issueRoomSessionToken));

export default router;
