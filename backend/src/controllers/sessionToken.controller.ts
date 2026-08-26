import { Request, Response } from "express";
import { createSessionToken } from "../services/token.service";
import { AppError } from "../middleware/errorHandler";

// Room IDs are short URL-safe identifiers (UUID slices, slugs like "test-room")
const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

/**
 * Issues a short-lived Room Session Token for the requested room.
 * This endpoint is intentionally public — it is the only way a client can
 * obtain credentials; every protected route then requires the token.
 */
export const issueRoomSessionToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const roomId = req.params.roomId || req.body?.roomId;

  if (!roomId || typeof roomId !== "string" || !ROOM_ID_PATTERN.test(roomId)) {
    throw new AppError(
      400,
      "A valid 'roomId' (4–64 chars: letters, digits, '-' or '_') is required",
    );
  }

  const { token, expiresInMs } = createSessionToken(roomId);

  res.json({ token, expiresInMs });
};
