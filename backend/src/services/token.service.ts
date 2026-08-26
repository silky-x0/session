import { createHmac, timingSafeEqual } from "node:crypto";
import { AppError } from "../middleware/errorHandler";
import { config } from "../config/env";

/**
 * Room Session Token service
 *
 * Issues and verifies short-lived, self-contained JWTs (HS256) bound to a
 * specific roomId. Chosen over full User Auth because the product is a
 * login-less, ephemeral pair-programming tool — anyone with a room link can
 * collaborate, but API access still requires a token minted by this server.
 *
 * Format: base64url(header).base64url(payload).base64url(HMAC-SHA256)
 */

export interface SessionTokenPayload {
  roomId: string;
  iat: number;
  exp: number;
}

// Tokens live for 2 hours — long enough for an interview-style pairing session,
// short enough that a leaked link/token expires quickly
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const getSessionSecret = (): string => {
  const secret = config.sessionTokenSecret;
  if (!secret) {
    throw new AppError(
      500,
      "Server authentication is not configured: set SESSION_TOKEN_SECRET (or LIVEBLOCKS_SECRET_KEY)",
    );
  }
  return secret;
};

const encodeSegment = (value: string): string =>
  Buffer.from(value, "utf8").toString("base64url");

const signData = (data: string): string =>
  createHmac("sha256", getSessionSecret()).update(data).digest("base64url");

/**
 * Mints a signed room session token for the given room
 */
export const createSessionToken = (
  roomId: string,
): { token: string; expiresInMs: number } => {
  const header = encodeSegment(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const issuedAt = Date.now();
  const payload = encodeSegment(
    JSON.stringify({
      roomId,
      iat: issuedAt,
      exp: issuedAt + TOKEN_TTL_MS,
    }),
  );

  const signature = signData(`${header}.${payload}`);
  return {
    token: `${header}.${payload}.${signature}`,
    expiresInMs: TOKEN_TTL_MS,
  };
};

/**
 * Verifies signature and expiry of a room session token.
 * Throws AppError(401) on any failure; returns the decoded payload on success.
 */
export const verifySessionToken = (token: string): SessionTokenPayload => {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new AppError(401, "Invalid session token format");
  }

  const [header, payloadSegment, signature] = parts;
  const expectedSignature = signData(`${header}.${payloadSegment}`);

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new AppError(401, "Invalid session token signature");
  }

  let payload: SessionTokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(payloadSegment, "base64url").toString("utf8"),
    );
  } catch {
    throw new AppError(401, "Malformed session token payload");
  }

  if (!payload.roomId || typeof payload.exp !== "number") {
    throw new AppError(401, "Malformed session token payload");
  }

  if (Date.now() >= payload.exp) {
    throw new AppError(401, "Session token has expired");
  }

  return payload;
};
