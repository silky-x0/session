import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

// Mock external services reached behind the auth layer
vi.mock('../../src/services/execute.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/services/execute.service')>();
  return {
    ...actual,
    handleCodeExecution: vi.fn(),
  };
});

vi.mock('../../src/services/aichat.service', () => ({
  handleAiChat: vi.fn(),
}));

import { handleCodeExecution } from '../../src/services/execute.service';
import { handleAiChat } from '../../src/services/aichat.service';
import { createSessionToken, verifySessionToken } from '../../src/services/token.service';

const ROOM_ID = 'auth-test-room';

const getRoomToken = async (roomId = ROOM_ID): Promise<string> => {
  const response = await request(app).post(`/api/sessions/${roomId}/token`).expect(200);
  return response.body.token;
};

describe('Room Session Token auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/sessions/:roomId/token', () => {
    it('issues a signed token with expiry info', async () => {
      const response = await request(app)
        .post(`/api/sessions/${ROOM_ID}/token`)
        .expect(200);

      expect(response.body.token).toBeTruthy();
      expect(response.body.token.split('.')).toHaveLength(3);
      expect(response.body.expiresInMs).toBeGreaterThan(0);
    });

    it('rejects invalid room ids with 400', async () => {
      await request(app).post('/api/sessions/ab/token').expect(400);
      await request(app).post('/api/sessions/bad%20room!/token').expect(400);
      await request(app).post('/api/sessions//token').expect(404);
    });
  });

  describe('POST /api/code/execute (protected)', () => {
    const executeBody = { language: 'python', code: 'print(1)' };

    it('returns 401 without an Authorization header', async () => {
      const response = await request(app)
        .post('/api/code/execute')
        .send(executeBody)
        .expect(401);

      expect(response.body.error).toMatch(/Missing Authorization header/i);
    });

    it('returns 401 with a malformed Authorization header', async () => {
      await request(app)
        .post('/api/code/execute')
        .set('Authorization', 'Basic abc123')
        .send(executeBody)
        .expect(401);
    });

    it('returns 401 with an invalid token signature', async () => {
      await request(app)
        .post('/api/code/execute')
        .set('Authorization', 'Bearer not.a.realtoken')
        .send(executeBody)
        .expect(401);
    });

    it('returns 403 when the token was issued for another room', async () => {
      const otherRoomToken = await getRoomToken('some-other-room');

      await request(app)
        .post('/api/code/execute')
        .set('Authorization', `Bearer ${otherRoomToken}`)
        .set('x-room-id', ROOM_ID)
        .send(executeBody)
        .expect(403);
    });

    it('accepts a valid token and reaches the controller', async () => {
      vi.mocked(handleCodeExecution).mockResolvedValue({
        stdout: '1',
        stderr: '',
        exitCode: 0,
        timedOut: false,
      });

      const token = await getRoomToken();

      const response = await request(app)
        .post('/api/code/execute')
        .set('Authorization', `Bearer ${token}`)
        .set('x-room-id', ROOM_ID)
        .send(executeBody)
        .expect(200);

      expect(handleCodeExecution).toHaveBeenCalledTimes(1);
      expect(response.body.stdout).toBe('1');
    });

    it('returns 413 when code exceeds the 20 KB payload limit', async () => {
      const token = await getRoomToken();
      const oversizedCode = 'x'.repeat(20 * 1024 + 1);

      const response = await request(app)
        .post('/api/code/execute')
        .set('Authorization', `Bearer ${token}`)
        .set('x-room-id', ROOM_ID)
        .send({ language: 'python', code: oversizedCode })
        .expect(413);

      expect(response.body.error).toMatch(/20 KB/i);
      expect(handleCodeExecution).not.toHaveBeenCalled();
    });

    it('rejects expired tokens with 401', async () => {
      // Mint a token "3 hours ago" so its 2 h TTL has elapsed
      const realNow = Date.now.bind(Date);
      Date.now = () => realNow() - 3 * 60 * 60 * 1000;
      const expiredToken = createSessionToken(ROOM_ID).token;
      Date.now = realNow;

      await request(app)
        .post('/api/code/execute')
        .set('Authorization', `Bearer ${expiredToken}`)
        .send(executeBody)
        .expect(401);

      expect(() => verifySessionToken(expiredToken))
        .toThrow(/expired/i);
    });
  });

  describe('POST /api/ai/chat (protected)', () => {
    it('returns 401 without a token', async () => {
      await request(app)
        .post('/api/ai/chat')
        .send({ prompt: 'hello' })
        .expect(401);
    });

    it('accepts a valid token and returns the AI response', async () => {
      vi.mocked(handleAiChat).mockResolvedValue('Here is the answer');

      const token = await getRoomToken();

      await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .set('x-room-id', ROOM_ID)
        .send({ prompt: 'How do I optimize this?' })
        .expect(200)
        .expect('Content-Type', /json/)
        .then((res) => {
          expect(res.body.response).toBe('Here is the answer');
        });
    });
  });
});
