import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/openRouter', () => ({
  openRouter: {
    chat: {
      send: vi.fn(),
    },
  },
}));

import { generateOpenRouterContent } from './session.service';
import { openRouter } from '../config/openRouter';

describe('session.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOpenRouterContent', () => {
    it('should generate content from a prompt', async () => {
      const mockResponse = {
        title: 'Two Sum Problem',
        language: 'javascript',
        content: 'function twoSum(nums, target) { /* solution */ }',
        difficulty: 'Easy',
        starter_code: 'function twoSum(nums, target) {}',
        hints: ['Use a hash map'],
        complexity: { time: 'O(n)', space: 'O(n)' },
        question: 'Given an array of integers...',
      };

      vi.mocked(openRouter.chat.send).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      } as any);

      const result = await generateOpenRouterContent('Two sum problem in JavaScript');

      expect(result).toEqual(mockResponse);
      expect(openRouter.chat.send).toHaveBeenCalledOnce();
      expect(openRouter.chat.send).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mistralai/devstral-2512:free',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Two sum problem in JavaScript' }),
          ]),
        })
      );
    });

    it('should handle markdown-wrapped JSON responses', async () => {
      const mockResponse = { title: 'Test', language: 'python', content: 'pass' };
      
      vi.mocked(openRouter.chat.send).mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
            },
          },
        ],
      } as any);

      const result = await generateOpenRouterContent('Test prompt');

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when no content is generated', async () => {
      vi.mocked(openRouter.chat.send).mockResolvedValue({
        choices: [{ message: { content: null } }],
      } as any);

      // The service wraps errors with "Failed to generate content from OpenRouter"
      await expect(generateOpenRouterContent('Test')).rejects.toThrow(
        'Failed to generate content from OpenRouter'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(openRouter.chat.send).mockRejectedValue(new Error('API Error'));

      await expect(generateOpenRouterContent('Test')).rejects.toThrow(
        'Failed to generate content from OpenRouter'
      );
    });
  });
});
