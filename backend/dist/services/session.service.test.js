"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
vitest_1.vi.mock('../config/kimi2thinking', () => ({
    openai: {
        chat: {
            completions: {
                create: vitest_1.vi.fn(),
            },
        },
    },
}));
const session_service_1 = require("./session.service");
const kimi2thinking_1 = require("../config/kimi2thinking");
(0, vitest_1.describe)('session.service', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('generateAIContent', () => {
        (0, vitest_1.it)('should generate content from a prompt', async () => {
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
            vitest_1.vi.mocked(kimi2thinking_1.openai.chat.completions.create).mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: JSON.stringify(mockResponse),
                        },
                    },
                ],
            });
            const result = await (0, session_service_1.generateAIContent)('Two sum problem in JavaScript');
            (0, vitest_1.expect)(result).toEqual(mockResponse);
            (0, vitest_1.expect)(kimi2thinking_1.openai.chat.completions.create).toHaveBeenCalledOnce();
            (0, vitest_1.expect)(kimi2thinking_1.openai.chat.completions.create).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                model: 'moonshotai/kimi-k2-thinking',
                messages: vitest_1.expect.arrayContaining([
                    vitest_1.expect.objectContaining({ role: 'user', content: 'Two sum problem in JavaScript' }),
                ]),
            }));
        });
        (0, vitest_1.it)('should handle markdown-wrapped JSON responses', async () => {
            const mockResponse = { title: 'Test', language: 'python', content: 'pass' };
            vitest_1.vi.mocked(kimi2thinking_1.openai.chat.completions.create).mockResolvedValue({
                choices: [
                    {
                        message: {
                            content: '```json\n' + JSON.stringify(mockResponse) + '\n```',
                        },
                    },
                ],
            });
            const result = await (0, session_service_1.generateAIContent)('Test prompt');
            (0, vitest_1.expect)(result).toEqual(mockResponse);
        });
        (0, vitest_1.it)('should throw error when no content is generated', async () => {
            vitest_1.vi.mocked(kimi2thinking_1.openai.chat.completions.create).mockResolvedValue({
                choices: [{ message: { content: null } }],
            });
            await (0, vitest_1.expect)((0, session_service_1.generateAIContent)('Test')).rejects.toThrow('No content generated');
        });
        (0, vitest_1.it)('should throw error on API failure', async () => {
            vitest_1.vi.mocked(kimi2thinking_1.openai.chat.completions.create).mockRejectedValue(new Error('API Error'));
            await (0, vitest_1.expect)((0, session_service_1.generateAIContent)('Test')).rejects.toThrow('API Error');
        });
    });
});
