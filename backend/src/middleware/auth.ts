import { Request, Response, NextFunction } from "express";
import {
  verifySessionToken,
  type SessionTokenPayload,
} from "../services/token.service";
import { AppError } from "./errorHandler";

declare module "express-serve-static-core" {
  interface Request {
    session?: SessionTokenPayload;
  }
}

/**
 * Resolves the roomId a request is targeting, using the same resolution
 * order as the compound-key rate limiter:
 * body.roomId → query.room → x-room-id header → Referer ?room= param
 */
export const resolveRequestRoomId = (req: Request): string => {
  if (typeof req.body?.roomId === "string" && req.body.roomId) {
    return req.body.roomId;
  }

  const queryRoom = req.query?.room;
  if (typeof queryRoom === "string" && queryRoom) {
    return queryRoom;
  }

  const headerRoom = req.headers["x-room-id"];
  if (typeof headerRoom === "string" && headerRoom) {
    return headerRoom;
  }

  if (typeof req.headers.referer === "string") {
    try {
      return new URL(req.headers.referer).searchParams.get("room") || "";
    } catch {}
  }

  return "";
};

/**
 * Verifies the `Authorization: Bearer <token>` header on incoming requests.
 *
 * - 401 if the header is missing/malformed, signature is invalid, or token expired
 * - 403 if the token was issued for a different room than this request targets
 * - On success, attaches the decoded payload to `req.session` and calls next()
 */
export const validateSessionToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        401,
        "Missing Authorization header. Expected: Authorization: Bearer <token>",
      );
    }

    const token = authHeader.slice("Bearer ".length).trim();
    const payload = verifySessionToken(token);

    const requestRoomId = resolveRequestRoomId(req);
    if (requestRoomId && requestRoomId !== payload.roomId) {
      throw new AppError(403, "Session token is not valid for this room");
    }

    req.session = payload;
    next();
  } catch (error) {
    next(error);
  }
};
