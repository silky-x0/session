import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

// Mock the session service
vi.mock('../../src/services/session.service', () => ({
  generateOpenRouterContent: vi.fn(),
}));

// Mock the aichat service
vi.mock('../../src/services/aichat.service', () => ({
  handleAiChat: vi.fn(),
}));

// Mock the yjs service
vi.mock('../../src/services/yjs.service', () => ({
  initializeDoc: vi.fn(),
}));

import { generateOpenRouterContent } from '../../src/services/session.service';
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

      vi.mocked(generateOpenRouterContent).mockResolvedValue(mockContent);

      const response = await request(app)
        .post('/api/ai/session')
        .send({ prompt: 'Two sum problem' })
        .expect('Content-Type', /json/)
        .expect(200);

      // The API returns only roomId, not the full content
      expect(response.body).toHaveProperty('roomId');
      expect(typeof response.body.roomId).toBe('string');
      expect(generateOpenRouterContent).toHaveBeenCalledWith('Two sum problem');
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
      vi.mocked(generateOpenRouterContent).mockRejectedValue(new Error('Service error'));

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
