import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

// Mock the gemini service
vi.mock('../../src/services/gemini.service', () => ({
  generateAIContentGemini: vi.fn(),
}));

// Mock the liveblocks service
vi.mock('../../src/services/liveblocks.service', () => ({
  seedLiveblocksRoom: vi.fn(),
}));

// Mock the aichat service
vi.mock('../../src/services/aichat.service', () => ({
  handleAiChat: vi.fn(),
}));

// Mock the yjs service
vi.mock('../../src/services/yjs.service', () => ({
  initializeDoc: vi.fn(),
}));

import { generateAIContentGemini } from '../../src/services/gemini.service';
import { seedLiveblocksRoom } from '../../src/services/liveblocks.service';
import { handleAiChat } from '../../src/services/aichat.service';

describe('API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/ai/session', () => {
    it('should create a new AI session with generated content', async () => {
      const mockContent = {
        title: 'Two Sum',
        language: 'javascript',
        content: 'function twoSum() {}',
        difficulty: 'Easy',
        starter_code: 'function twoSum() {}',
        hints: ['Use hash map'],
        complexity: { time: 'O(n)', space: 'O(n)' },
        question: 'Given an array...',
      };

      vi.mocked(generateAIContentGemini).mockResolvedValue(mockContent);
      vi.mocked(seedLiveblocksRoom).mockResolvedValue();

      const response = await request(app)
        .post('/api/ai/session')
        .send({ prompt: 'Two sum problem' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('roomId');
      expect(typeof response.body.roomId).toBe('string');
      expect(generateAIContentGemini).toHaveBeenCalledWith('Two sum problem');
      expect(seedLiveblocksRoom).toHaveBeenCalled();
    });

    it('should return 400 when prompt is missing', async () => {
      const response = await request(app)
        .post('/api/ai/session')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Prompt is required');
    });

    it('should return 500 on service errors', async () => {
      vi.mocked(generateAIContentGemini).mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/ai/session')
        .send({ prompt: 'Test prompt' })
        .expect(500);

      expect(response.body).toHaveProperty('error', 'Failed to create AI session');
    });
  });

  describe('POST /api/ai/chat', () => {
    it('should respond to chat messages', async () => {
      vi.mocked(handleAiChat).mockResolvedValue('Here is the answer');

      const response = await request(app)
        .post('/api/ai/chat')
        .send({ 
          prompt: 'How do I optimize this?',  
          codeContext: 'function example() {}',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('response', 'Here is the answer');
    });

    it('should return 400 when prompt is missing', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ codeContext: 'some code' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Prompt is required');
    });
  });
});
