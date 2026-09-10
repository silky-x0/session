import { AccessToken } from "livekit-server-sdk";
import { AppError } from "../middleware/errorHandler";
import { config } from "../config/env";

/**
 * LiveKit token service — mints SFU access tokens.
 * SFU (not mesh P2P): server forwards encrypted media, no transcoding.
 * Scales to 100+ per room, ~100-150ms same-region, TURN built-in.
 */
export const createLivekitToken = async (opts: {
  roomId: string;
  identity: string;
  name?: string;
}): Promise<string> => {
  const { roomId, identity, name } = opts;

  if (!config.livekitUrl || !config.livekitApiKey || !config.livekitApiSecret) {
    throw new AppError(
      500,
      "LiveKit is not configured: set LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET",
    );
  }

  const at = new AccessToken(
    config.livekitApiKey,
    config.livekitApiSecret,
    {
      identity,
      name: name || identity,
      // 2h — matches room session token TTL
      ttl: "2h",
    },
  );

  at.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await at.toJwt();
};
