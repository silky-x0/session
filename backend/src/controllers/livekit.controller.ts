import { Request, Response } from "express";
import { z } from "zod";
import { createLivekitToken } from "../services/livekit.service";
import { AppError } from "../middleware/errorHandler";

const ROOM_ID_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

const tokenSchema = z.object({
  roomId: z.string().regex(ROOM_ID_PATTERN, "Invalid roomId"),
  identity: z.string().min(1).max(64),
  name: z.string().min(1).max(64).optional(),
});

/**
 * POST /api/livekit/token
 * Protected by validateSessionToken — session room must match body roomId.
 * Returns { token, url } for livekit-client.
 */
export const issueLivekitToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = tokenSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, parsed.error.issues[0]?.message || "Invalid input");
  }

  const { roomId, identity, name } = parsed.data;

  // Enforce room binding: session token room must equal requested room
  const sessionRoom = req.session?.roomId;
  if (sessionRoom && sessionRoom !== roomId) {
    throw new AppError(403, "Session token is not valid for this room");
  }

  const token = await createLivekitToken({ roomId, identity, name });

  res.json({
    token,
    url: process.env.LIVEKIT_URL,
  });
};
