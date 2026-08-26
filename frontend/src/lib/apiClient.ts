const API_URL: string =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:1234";

interface RoomToken {
  token: string;
  expiresAt: number;
}

// In-memory token cache, keyed by roomId.
// Tokens live 2h server-side; we refetch when within 5 min of expiry.
const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;
const tokenCache = new Map<string, RoomToken>();

/**
 * Fetches a short-lived Room Session Token from the backend.
 * Tokens are cached in memory per room and refreshed before expiry.
 */
export async function getRoomToken(roomId: string): Promise<string> {
  const cached = tokenCache.get(roomId);
  if (cached && Date.now() < cached.expiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return cached.token;
  }

  const response = await fetch(
    `${API_URL}/api/sessions/${encodeURIComponent(roomId)}/token`,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(`Failed to obtain room session token (${response.status})`);
  }

  const data = await response.json();
  tokenCache.set(roomId, {
    token: data.token,
    expiresAt: Date.now() + (data.expiresInMs ?? 0),
  });
  return data.token;
}

function invalidateRoomToken(roomId: string) {
  tokenCache.delete(roomId);
}

/**
 * fetch wrapper for protected backend routes.
 * Attaches `Authorization: Bearer <roomToken>` and retries once with a
 * fresh token if the server responds 401 (e.g. expired session).
 */
export async function authedFetch(
  path: string,
  roomId: string,
  init: RequestInit = {},
): Promise<Response> {
  const doFetch = async (): Promise<Response> => {
    const token = await getRoomToken(roomId);
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${API_URL}${path}`, { ...init, headers });
  };

  let response = await doFetch();
  if (response.status === 401) {
    invalidateRoomToken(roomId);
    response = await doFetch();
  }
  return response;
}
