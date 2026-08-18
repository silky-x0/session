import { Router } from 'express';
import { createAiSession } from '../controllers/session.controller';
import { chatWithAI } from '../controllers/aichat.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import {
  globalIpAiServiceLimiter,
  roomAiServiceLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// Apply AI rate limiters in series
router.use(globalIpAiServiceLimiter);
router.use(roomAiServiceLimiter);

router.post('/session', asyncHandler(createAiSession));
router.post('/chat', asyncHandler(chatWithAI));

export default router;
