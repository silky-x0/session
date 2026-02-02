import { Router } from 'express';
import { createAiSession } from '../controllers/session.controller';
import { chatWithAI } from '../controllers/aichat.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

// All AI-related routes
router.post('/session', asyncHandler(createAiSession));
router.post('/chat', asyncHandler(chatWithAI));

export default router;
