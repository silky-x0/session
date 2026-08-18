import { Router } from 'express';
import { createAiSession } from '../controllers/session.controller';
import { chatWithAI } from '../controllers/aichat.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { aiServiceLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(aiServiceLimiter);

router.post('/session', asyncHandler(createAiSession));
router.post('/chat', asyncHandler(chatWithAI));

export default router;
