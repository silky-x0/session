import { authedFetch } from "./apiClient";

const LIVEKIT_URL =
  (import.meta.env.VITE_LIVEKIT_URL as string | undefined) ||
  (import.meta.env.LIVEKIT_URL as string | undefined);

export async function getLivekitCredentials(
  roomId: string,
  identity: string,
  name?: string,
): Promise<{ token: string; url: string }> {
  const res = await authedFetch(`/api/livekit/token`, roomId, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomId, identity, name: name || identity }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `LiveKit token failed (${res.status})`);
  }

  const data = await res.json();
  const url = data.url || LIVEKIT_URL;

  if (!data.token) throw new Error("LiveKit token missing from server");
  if (!url) throw new Error("LIVEKIT_URL not configured");

  return { token: data.token, url };
}

export function getLivekitUrlSync(): string | undefined {
  return LIVEKIT_URL;
}
