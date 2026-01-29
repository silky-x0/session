import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.OPENROUTER_API_KEY = 'test-api-key';
  process.env.GEMINI_API_KEY = 'test-gemini-key';
});

afterAll(() => {
  // Clean up
  vi.restoreAllMocks();
});
