import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/kimi2thinking', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

import { generateAIContent } from './session.service';
import { openai as kimi } from '../config/kimi2thinking';

describe('session.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAIContent', () => {
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

      vi.mocked(kimi.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(mockResponse),
            },
          },
        ],
      } as any);

      const result = await generateAIContent('Two sum problem in JavaScript');

      expect(result).toEqual(mockResponse);
      expect(kimi.chat.completions.create).toHaveBeenCalledOnce();
      expect(kimi.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'moonshotai/kimi-k2-thinking',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Two sum problem in JavaScript' }),
          ]),
        })
      );
    });

    it('should handle markdown-wrapped JSON responses', async () => {
      const mockResponse = { title: 'Test', language: 'python', content: 'pass' };

      vi.mocked(kimi.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
            },
          },
        ],
      } as any);

      const result = await generateAIContent('Test prompt');

      expect(result).toEqual(mockResponse);
    });

    it('should throw error when no content is generated', async () => {
      vi.mocked(kimi.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: null } }],
      } as any);

      await expect(generateAIContent('Test')).rejects.toThrow(
        'No content generated'
      );
    });

    it('should throw error on API failure', async () => {
      vi.mocked(kimi.chat.completions.create).mockRejectedValue(new Error('API Error'));

      await expect(generateAIContent('Test')).rejects.toThrow('API Error');
    });
  });
});

