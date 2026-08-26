import { Router } from 'express';
import { createAiSession } from '../controllers/session.controller';
import { chatWithAI } from '../controllers/aichat.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateSessionToken } from '../middleware/auth';
import {
  globalIpAiServiceLimiter,
  roomAiServiceLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// Apply AI rate limiters in series
router.use(globalIpAiServiceLimiter);
router.use(roomAiServiceLimiter);

// Public: this endpoint creates rooms (mints the roomId), so no token exists yet
router.post('/session', asyncHandler(createAiSession));

// Protected: requires a room session token for the target room
router.post('/chat', validateSessionToken, asyncHandler(chatWithAI));

export default router;
