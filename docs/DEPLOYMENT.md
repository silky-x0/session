# Deployment

## Production URLs

| Service               | URL                                         |
|-----------------------|---------------------------------------------|
| **Frontend (Vercel)** | https://session-ecru.vercel.app/            |
| **Backend (Render)**  | _Set via `VITE_API_URL` env var_            |

---

## Backend — Render

| Setting            | Value                |
|--------------------|----------------------|
| **Root Directory** | `backend`            |
| **Build Command**  | `npm install && npm run build` |
| **Start Command**  | `npm start`          |
| **Node Version**   | 18+                  |

**Required environment variables on Render:**

```
PORT
FRONTEND_URL       ← your Vercel URL
OPEN_ROUTER_KEY
LIVEBLOCKS_SECRET_KEY
LIVEBLOCKS_WEBHOOK_SECRET   ← from Liveblocks Dashboard → Webhooks
REDIS_URL                    ← from Redis Cloud (rediss://... with TLS)
```

See [ENV_VARS.md](./ENV_VARS.md) for full reference.

---

## Frontend — Vercel

| Setting            | Value                          |
|--------------------|--------------------------------|
| **Root Directory** | `frontend`                     |
| **Build Command**  | `npm install && npm run build` |
| **Output Dir**     | `dist`                         |
| **Framework**      | Vite                           |

**Required environment variables on Vercel:**

```
VITE_API_URL                  ← your Render backend URL  
VITE_LIVEBLOCKS_PUBLIC_KEY    ← pk_prod_...
```

### Vercel Routing Fix

Add a `vercel.json` in the `frontend/` directory to handle React Router client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Redis Cloud

The BullMQ room-deletion queue requires a Redis instance. The free **30 MB** tier on [Redis Cloud](https://redis.io/cloud/) is sufficient.

| Setting | Value |
|---|---|
| **Provider** | Redis Cloud (redis.io) |
| **Tier** | Free 30 MB |
| **Eviction Policy** | `noeviction` (change in database settings — free tier defaults to `volatile-lru`) |

Construct the connection URL from the Redis Cloud dashboard's connection snippet:
```
rediss://default:<password>@<host>:<port>
```
> Use `rediss://` (with double `s`) for TLS — required on Redis Cloud production databases.

---

## Docker Images (for Code Execution)

The backend's execution service requires these images to be available on the host machine running the backend:

```bash
docker pull python:3.11-alpine
docker pull node:20-alpine
docker pull gcc:latest
```

> On Render, Docker is not available on free-tier instances. The execution feature requires a plan with Docker access, or an alternative self-hosted deployment.

---

## Health Check

Once deployed, verify:

1. `GET https://<your-backend>/` — should return `200 OK`
2. Open `https://session-ecru.vercel.app/` — landing page loads
3. Start a session — editor route with "WORKSPACE" transition
4. Open the same URL in another tab — real-time sync works
