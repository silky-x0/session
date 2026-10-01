# Architecture

## Overview

Session is a full-stack monorepo with a React frontend and a Node.js/Express backend. Real-time collaboration is handled by **Liveblocks** (cloud CRDT/presence) + **Yjs** (conflict-free document model), and code execution is handled via the **JDoodle API** (ideal for serverless & PaaS cloud platforms) with an optional **Docker** container execution strategy for self-hosted setups.

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  React 19 + Vite    Monaco Editor    Framer Motion          │
│  Liveblocks React   Yjs + y-monaco   React Router v7        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS / WSS
            ┌────────────────┴─────────────────┐
            │          Liveblocks Cloud         │
            │  (Room presence, Yjs storage,     │
            │   awareness, broadcast channel)   │
            └────────────────┬─────────────────┘
                             │ REST (seeding, AI)
┌────────────────────────────▼────────────────────────────────┐
│                   Express Backend (Node.js)                 │
│   Routes → Controllers → Services → External APIs          │
│                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐  │
│   │ session.svc  │  │  aichat.svc  │  │  execute.svc   │  │
│   │ (AI codegen  │  │ (AI chat via │  │  (JDoodle API /│  │
│   │  + LB seed)  │  │  OpenRouter) │  │   Docker)      │  │
│   └──────────────┘  └──────────────┘  └───────┬────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
  [Primary Cloud Execution]                                     [Self-Hosted Option]
  ┌──────────────────────────────┐                               ┌─────────────────────────────┐
  │   JDoodle REST API           │                               │    Docker Engine (host)      │
  │   https://api.jdoodle.com    │                               │  python:3.11-alpine         │
  │   (Cloud execution runner)   │                               │  node:20-alpine / gcc       │
  └──────────────────────────────┘                               └─────────────────────────────┘
```

---

## Frontend Architecture

### Component Tree

```
App.tsx
├── LiveblocksProvider          ← global room client
└── BrowserRouter
    └── AnimatedRoutes
        ├── / → RouteTransition("SESSION")
        │         └── LandingPage
        │               ├── Header
        │               ├── Hero
        │               ├── SessionInput      ← start/join flow
        │               │     └── SessionLoadingScreen (overlay)
        │               ├── Marquee
        │               └── Footer
        │
        └── /editor → RouteTransition("WORKSPACE", isReady)
                        └── CollaborativeEditor (RoomProvider)
                              └── ClientSideSuspense
                                    └── CollaborativeEditorInner
                                          ├── TopBar
                                          ├── ProblemPanel
                                          │     └── QuestionSidebar (5-slot browser: ready/generating/pending/error, retry via startFromIndex)
                                          ├── CodeEditor (Monaco, single instance rebound per Y.Text("monaco-q{n}"))
                                          ├── AIChat (Yjs-synced)
                                          ├── OutputPanel
                                          ├── Whiteboard (Excalidraw, Y.Text("whiteboard"))
                                          ├── video-call/ (LiveKit: VideoCall, CallControls, FullscreenCall, FloatingCallWindow, hooks)
                                          ├── SettingsPanel + metrics/ (ExecutionTimeChart, MemoryUsageChart, RuntimeComparison)
                                          ├── LiveCursors + AvatarStack
                                          ├── ConnectionToast + SyncStatusBadge
                                          └── BroadcastProvider
```

### Key Patterns

| Pattern | Where | Why |
|---|---|---|
| `RouteTransition` + `isReady` prop | `App.tsx` + `RouteTransition.tsx` | Overlay stays until Liveblocks room is `"connected"` |
| `useStatus()` from Liveblocks | `CollaborativeEditorInner` | Fires `onRoomReady` when connection is live |
| `ClientSideSuspense` | `Editor.tsx` | Prevents SSR flash; shows fallback during room init |
| `BroadcastProvider` | `editor/` | Wraps editor components for Liveblocks broadcast events |
| `AnimatePresence` + `key={location.pathname}` | `App.tsx` | Enables page-level exit/enter animations |

---

## Backend Architecture

### Request Flow

```
HTTP Request
  → CORS middleware
  → /webhook branch (raw body, HMAC verify) ← exits here for webhook events
  → express.json() body parser (512 KB global cap → 413)
  → globalApiLimiter (all /api/* routes)
  → POST /api/sessions/:roomId/token (public) ← mints room session token, exits here
  → validateSessionToken on protected routes (/api/code/*, /api/ai/chat, POST /api/ai/session/generate-remaining, POST /livekit/token)
      401 missing/invalid/expired · 403 room mismatch · req.session = payload
  → Route-specific dual-key limiters
    → Controller (controllers/, per-field payload caps → 413)
      → Service (services/)
        → External API / JDoodle / Liveblocks Node SDK
          → Response
```

### Room Session Token Auth

The product is login-less: anyone with a room link can collaborate via Liveblocks' public key. To stop anonymous abuse of paid backend resources (JDoodle credits, AI tokens), protected REST routes require a **Room Session Token** — chosen over full User Auth to preserve the zero-friction UX:

1. Client entering the editor calls `POST /api/sessions/:roomId/token` (public, rate-limited).
2. Backend returns a short-lived (2 h) self-contained JWT (HS256, `node:crypto` — no extra deps) bound to `{ roomId, iat, exp }`, signed with `SESSION_TOKEN_SECRET` (falls back to `LIVEBLOCKS_SECRET_KEY`).
3. Every request to `/api/code/*`, `/api/ai/chat`, `POST /api/ai/session/generate-remaining` and `POST /livekit/token` carries `Authorization: Bearer <token>`.
4. `validateSessionToken` (`middleware/auth.ts`) verifies signature + expiry (401), that the token's room matches the request's target room resolved from `body.roomId → query.room → x-room-id → Referer` (403), then attaches the decoded payload as `req.session`. Stateless — no Redis lookup; rate limiting handles volume separately.
5. The frontend caches tokens per room in `lib/apiClient.ts` and transparently re-mints once on a 401.

Payload size limits guard individual fields before they reach paid services or get echoed in error messages: code ≤ 20 KB, stdin ≤ 10 KB, prompt ≤ 8 KB, codeContext ≤ 20 KB, language ≤ 32 chars, plus a 512 KB global JSON body cap (`entity.too.large` → 413).

### Layered Design

```
backend/src/
├── index.ts                  ← server entry, port bind, graceful shutdown
├── app.ts                    ← Express app, middleware, routes
├── config/
│   ├── env.ts                ← all env vars + CORS config
│   ├── ai.config.ts          ← AI provider selection (gemini / openrouter)
│   ├── liveblock.ts          ← Liveblocks Node client
│   └── redis.ts              ← connection factory + fail-fast helper
├── controllers/
│   ├── session.controller.ts      ← POST /api/ai/session + generate-remaining
│   ├── aichat.controller.ts       ← POST /api/ai/chat
│   ├── execute.controller.ts      ← POST /api/code/execute
│   ├── livekit.controller.ts       ← POST /livekit/token (room-bound SFU token)
│   ├── sessionToken.controller.ts   ← POST /api/sessions/:roomId/token
│   ├── webhook.controller.ts        ← Liveblocks webhook dispatcher
│   ├── userentered.controller.ts    ← cancel pending deletion
│   └── userleft.controller.ts       ← schedule deletion when empty
├── middleware/
│   ├── errorHandler.ts       ← global error handler
│   ├── asyncHandler.ts       ← wraps async route handlers
│   ├── auth.ts               ← validateSessionToken (Bearer room token) middleware
│   ├── rateLimiter.ts        ← Token Bucket rate limiting middleware (Redis-backed)
│   └── verifyLiveblocksWebhook.ts ← HMAC verify (raw body)
├── queues/
│   └── roomDeletion.queue.ts ← scheduleRoomDeletion() + cancelRoomDeletion()
├── workers/
│   └── roomDeletion.worker.ts ← safety re-check + liveblocks.deleteRoom()
├── routes/
│   ├── ai.routes.ts          ← /api/ai/session, /api/ai/session/generate-remaining, /api/ai/chat
│   ├── code.routes.ts        ← /api/code/execute
│   ├── session.routes.ts     ← /api/sessions/:roomId/token
│   ├── livekit.routes.ts     ← /livekit/token
│   └── webhook.routes.ts     ← /webhook (raw body, no rate limiters)
├── services/
│   ├── session.service.ts    ← Q1 gen → Liveblocks seed (Q1 + 4 pending slots)
│   ├── questionGenerator.service.ts ← background Q2–Q5 gen (retry + delta-patch)
│   ├── ai/                   ← promptClassifier.ts, prompts.ts (follow-ups), providers/
│   ├── liveblocks.service.ts ← Node SDK wrapper + patchLiveblocksQuestionSlot
│   ├── livekit.service.ts    ← SFU token minting
│   ├── token.service.ts      ← room session JWT mint/verify
│   ├── aichat.service.ts     ← streaming AI chat
│   ├── execute.service.ts    ← JDoodle API execution (JDoodle-only, no Docker runner)
│   └── yjs.service.ts        ← (legacy) in-memory Yjs store
└── utils/
    └── languageMapper.ts     ← maps language names → JDoodle codes
```

### Session Bootstrap Flow (multi-question)

When a user clicks **"Start Session"** with AI generation enabled:

```
1. Frontend POSTs to /api/ai/session  { prompt }
2. Backend classifies prompt (heuristic-first promptClassifier, AI fallback) → "problem" | "profile"
3. session.service.ts generates Q1 (Gemini by default, OpenRouter via AI_PROVIDER)
4. liveblocks.service.ts seeds the Liveblocks room via Node SDK:
     - yDoc.getArray("questions").insert() ← [Q1 ready + 4 pending slots]
     - yDoc.getText("monaco-q0").insert()   ← Q1 starter code (legacy "monaco" retired, kept as fallback)
5. Backend returns { roomId, promptType } immediately — no waiting for Q2–Q5
6. Frontend navigates to /editor?room=<roomId>&nickname=<name>
7. RouteTransition overlay stays until useStatus() === "connected"
8. After room sync, frontend fires POST /api/ai/session/generate-remaining once
   (guarded by pending-check + execution.queueStarted flag) → 202 fire-and-forget
9. questionGenerator.service.ts generates Q2→Q5 sequentially:
     patch slot → "generating" → AI call (buildFollowUpPrompt) → patch slot → "ready"
     + seed Y.Text("monaco-qN") — auto-retry ×2, else "error" with manual Retry (startFromIndex)
```

---

## API Security & Rate Limiting

### Why Rate Limiting is Critical for This Application

Session integrates three external **paid-per-invocation** API services: JDoodle (code execution), Google Gemini (session generation), and OpenRouter (AI chat). Without rate limiting, any unauthenticated caller reaching the deployed backend can drain API credits, cause financial cost overruns, or exhaust quota limits for all legitimate users.

### Algorithm: Redis-Backed Token Bucket

> **Why Token Bucket over alternatives?**
>
> - **Fixed Window**: Vulnerable to "double-bursting" — a client can make 2× the allowed limit by clustering requests around a window reset boundary. For a paid execution API, this means overspending on each burst window reset.
> - **Leaky Bucket**: Queues requests for constant-rate processing. A bot spam attack fills the queue and the backend continues calling JDoodle/Gemini for hours after the attack ends, draining credits even after the attacker has stopped.
> - **Sliding Window Log**: Stores a timestamp for every request in a Redis sorted set — memory usage scales linearly with traffic, leading to Redis Out-of-Memory (OOM) crashes under spam.
> - **Token Bucket** (chosen): Each request consumes one token from a bucket. Tokens accumulate continuously over time up to a maximum capacity. Short legitimate bursts (e.g., a developer clicking "Run" twice quickly) are absorbed by the token buffer, while sustained spam exhausts the bucket and is blocked immediately with HTTP 429. Memory usage is constant — only two numbers (`tokens`, `lastRefill`) per IP key in Redis.

**Token math per request:**
```
newTokens = min(capacity, oldTokens + (elapsedMs × refillRate))
refillRate = capacity / refillTimeMs  (tokens per millisecond)
```

Each bucket in Redis self-expires via a TTL set equal to `refillTimeMs`, so idle users are automatically garbage-collected.

### Dual-Key (Compound Key) Pattern

IP-only rate limiting breaks down on **shared networks** (university campuses, corporate offices, home NAT routers) where multiple users appear to the server as a single public IP address. One user consuming their rate limit would block all other users on the same network.

To solve this, rate limiters operate with two independent Redis keys in series:

| Layer | Redis Key | Limit | Purpose |
|---|---|---|---|
| **Global IP** | `ratelimit:{prefix}:{ip}` | 30 runs/min | Prevents a single IP from abusing multiple rooms to multiply their limit |
| **Room-Specific** | `ratelimit:{prefix}:{ip}:{roomId}` | 5 runs/min | Ensures fair per-workspace isolation so one room's user can't block another |

Both checks must pass before a request reaches the controller:

```
Request arrives at /api/code/execute
  → globalIpCodeExecutionLimiter checks ratelimit:global-ip-code-exec:{ip}
    → (if remaining > 0) consume token, pass through
      → roomCodeExecutionLimiter checks ratelimit:room-code-exec:{ip}:{roomId}
        → (if remaining > 0) consume token, pass through
          → executeCode controller → JDoodle API
    → (if 0 remaining) reject with HTTP 429 + Retry-After header
```

The `roomId` is resolved dynamically from `req.body.roomId`, `req.query.room`, `req.headers["x-room-id"]`, or parsed from the `Referer` header URL. If no room is present (e.g., a bot hitting the endpoint directly), the key falls back to IP-only, applying the stricter room-level limit.

### Rate Limiter Inventory

| Exported Middleware | Redis Key Pattern | Capacity | Window | Applied To |
|---|---|---|---|---|
| `globalIpCodeExecutionLimiter` | `ratelimit:global-ip-code-exec:{ip}` | 30 tokens | 1 minute | `POST /api/code/execute` (per-route) |
| `roomCodeExecutionLimiter` | `ratelimit:room-code-exec:{ip}:{roomId}` | 5 tokens | 1 minute | `POST /api/code/execute` (per-route) |
| `globalIpAiServiceLimiter` | `ratelimit:global-ip-ai-service:{ip}` | 50 tokens | 1 minute | All `GET/POST /api/ai/*` (router-level) |
| `roomAiServiceLimiter` | `ratelimit:room-ai-service:{ip}:{roomId}` | 10 tokens | 1 minute | All `GET/POST /api/ai/*` (router-level) |
| `globalApiLimiter` | `ratelimit:global-api:{ip}` | 100 tokens | 15 minutes | All `/api/*` (app-level) |

### Middleware Layering in app.ts

```
HTTP Request
  → CORS middleware
  ├── /webhook → express.raw() → verifyLiveblocksWebhook → handleWebhook
  │              (bypasses json parser and all rate limiters intentionally)
  └── /api/*
        → express.json()
        → globalApiLimiter      ← app.use("/api", globalApiLimiter)
        ├── /api/ai/*
        │     → globalIpAiServiceLimiter   ← router.use()
        │     → roomAiServiceLimiter       ← router.use()
        │     → /session → createAiSession controller
        │     → /chat    → chatWithAI controller
        └── /api/code/*
              → /execute
                  → globalIpCodeExecutionLimiter  ← per-route
                  → roomCodeExecutionLimiter       ← per-route
                  → executeCode controller
```

> **Fail-Open Behaviour**: If Redis is unreachable (connection error), the rate limiter logs the error and calls `next()` — requests are allowed through rather than failing closed. This prioritises availability for users over security during Redis downtime. For production hardening, consider adding a secondary in-memory fallback limiter.

---


## Real-Time Collaboration

### Yjs + Liveblocks

- **`Y.Array("questions")`** — 5 question slots (`pending` / `generating` / `ready` / `error`) with title, difficulty, hints, solution; observed by `QuestionSidebar`
- **`Y.Text("monaco-q{n}")`** — per-question shared code buffer, bound to Monaco via `MonacoBinding` (rebound on question switch; legacy `Y.Text("monaco")` kept as single-question fallback)
- **`Y.Text("whiteboard")`** — shared Excalidraw board state
- **`Y.Array("output")`** — shared execution output visible to all collaborators
- **`Y.Map("execution")`** — distributed lock to prevent concurrent execution + `queueStarted` double-trigger guard
- **Awareness** — user cursor position, color, nickname, and `currentQuestionIndex` synced via Liveblocks presence

### Presence Shape

```ts
// liveblocks.config.ts
type Presence = {
  cursor: { x: number; y: number } | null;
  isTyping: boolean;
  selectedLineNumber: number | null;
  currentQuestionIndex: number; // which question this user is viewing
  info: { name: string; color: string };
};
```

---

## Code Execution Pipeline

Session supports code execution via the **JDoodle API** (cloud sandboxes). There is no Docker execution path in the code.

### Execution Strategy & Architectural Decision

> **Why switch to JDoodle API for cloud deployments?**
>
> Most managed PaaS and serverless platforms—including Render, Railway, AWS Lambda, and Heroku—allow applications to be deployed as containers but do not provide ordinary application workloads with access to a host Docker daemon or Docker socket, so Docker-in-Docker and spawning sibling containers are generally not supported. Some platforms provide specialized sandboxed environments that support nested container execution; for example, Vercel Sandbox can run Docker inside an isolated Firecracker microVM.
> 
> By switching to the **JDoodle API** (`https://api.jdoodle.com/v1/execute`), code execution runs securely via external cloud sandboxes, eliminating host Docker dependencies and enabling zero-friction deployment on services like Render and Vercel.
>
> **Retaining both strategies**:
> - **JDoodle API** (shipped / default): Designed for cloud platform deployments without Docker daemon access. Executes multi-language code out-of-the-box using API key credentials (`JDOODLE_CLIENT_ID` / `JDOODLE_CLIENT_SECRET`).
> - **Docker Ephemeral Containers** (design sketch only): no Docker runner exists in `execute.service.ts` — see the "Alternative Flow (Planned, Not Implemented)" section below. Do not present it as a working self-hosted option.

---

### Primary Flow: JDoodle API Execution

```
User clicks "Run"
  → OutputPanel sends Liveblocks broadcast "execute"
    → BroadcastProvider receives broadcast
      → POST /api/execute  { code, language, stdin? }
        → execute.service.ts
          → Map language & version index (languageMapper)
          → Strip JS/TS export declarations for script runner
          → POST https://api.jdoodle.com/v1/execute
            → JSON response { output, statusCode, memory, cpuTime }
              → Y.Array("output").push(...)   ← synced across collaborators
```

---

### Alternative Flow (Planned, Not Implemented): Ephemeral Docker Container Execution

> **Status:** this flow is a design sketch only — there is no Docker execution
> path in the code (`execute.service.ts` is JDoodle-only, no container runtime
> dependency). Do not present it as a working feature.

```
User clicks "Run"
  → OutputPanel sends Liveblocks broadcast "execute"
    → BroadcastProvider receives broadcast
      → POST /api/execute  { code, language }
        → execute.service.ts
          → docker.run(image, code)   ← ephemeral container (NOT IMPLEMENTED)
            → stream stdout/stderr    ← demultiplexed
              → response chunks
                → Y.Array("output").push(...)   ← synced to all users
```

<br>

> The diagram below sketches the planned Docker execution lifecycle — from the browser "Run" click, through the Express backend, to the ephemeral container and back. (Design reference only; not implemented.)

<br>

![Docker Execution Service Diagram](../frontend/public/exec-backend.excalidraw.png)

#### Container Constraints (Planned Docker Mode)

```json
{
  "Memory": "256MB",
  "NanoCpus": 1,
  "PidsLimit": 64,
  "NetworkMode": "none",
  "CapDrop": ["ALL"],
  "SecurityOpt": ["no-new-privileges"]
}
```

> **Note**: In the planned Docker mode, execution queues could throttle concurrent container requests and prevent host resource exhaustion. (The shipped JDoodle path needs no host containers.)

---

## Room Lifecycle & Ephemeral Cleanup

Rooms are created by the AI session service and are considered **ephemeral** — they should be automatically deleted when all users leave and nobody returns within 15 minutes.

### Overview

![Room Cleanup Architecture](room-cleanup-arch.png)

### Components

| File | Role |
|---|---|
| `middleware/verifyLiveblocksWebhook.ts` | Verifies Liveblocks HMAC webhook signature using raw request body |
| `controllers/webhook.controller.ts` | Dispatcher — routes `userLeft` / `userEntered` events to their handlers |
| `controllers/userleft.controller.ts` | Schedules room deletion when `numActiveUsers === 0` |
| `controllers/userentered.controller.ts` | Cancels pending deletion when a user re-enters |
| `queues/roomDeletion.queue.ts` | BullMQ queue — `scheduleRoomDeletion()` + `cancelRoomDeletion()` helpers |
| `workers/roomDeletion.worker.ts` | Processes fired jobs — safety re-check + `liveblocks.deleteRoom()` |
| `config/redis.ts` | Connection factory (`createRedisConnection`) — one dedicated IORedis client per role (`app`, `room-deletion-queue`, `room-deletion-worker`), TLS auto-detected from `rediss://`, `maxRetriesPerRequest: null` for BullMQ, `withRedisTimeout` fail-fast helper |

### Deletion Flow

```
Liveblocks → POST /webhook
  → verifyLiveblocksWebhook (HMAC check)
    → handleWebhook (event type dispatcher)

[userLeft, numActiveUsers === 0]
  → scheduleRoomDeletion(roomId, 15min)
    → clear any stale delayed job, then BullMQ: queue.add(roomId, { roomId }, { jobId: roomId, delay: 15min, attempts: 3 })
      → Job persisted in Redis (survives server restarts)
      → Redis unreachable? Log loudly and skip — webhook still returns 200 (fail open)

[userEntered]
  → cancelRoomDeletion(roomId)
    → BullMQ: queue.remove(roomId)  ← no-op if job already fired/gone; never throws

[Job fires after 15min delay]
  → roomDeletion.worker.ts processor
    → liveblocks.getActiveUsers(roomId)
      → 404 (room already gone) → skip, no retry
      → if users present → abort (log DELETION_ABORTED)
      → if empty → liveblocks.deleteRoom(roomId)
        → success: log success
        → 404 (deleted meanwhile) → treat as success, no retry
        → failure: re-throw → BullMQ retries (3x, exponential backoff: 5s base)
```

### Key Design Decisions

- **Idempotency via `jobId: roomId` + last-empty-wins** — scheduling first removes any stale delayed job, then adds with `jobId: roomId`. A duplicate add (same pending job) is treated as already-scheduled, never an error.
- **Dedicated connection per role** — the queue, the worker and general commands each own an IORedis client (named `backend:<role>:pid-<pid>`, visible as separate clients on the Redis Cloud console). Never share one client across BullMQ roles.
- **Fail open on Redis outage** — queue ops have a 5s timeout; on failure the webhook logs loudly and still returns 200. Rate limiting already fails open the same way.
- **Bounded job retention** — completed/failed jobs are trimmed (`removeOnComplete`, `removeOnFail` counts) so the free-tier Redis database doesn't fill up.
- **Observability** — `GET /health` reports `redis: { status, ready }`; expect ~3 connected clients on the Redis Cloud console. Zero connections means the backend never reached Redis Cloud (usually `REDIS_URL` missing in that environment — without it the backend falls back to `redis://localhost:6379` and warns at boot).
- **Redis persistence** — delayed jobs survive backend restarts. A `setTimeout` alternative would lose all pending timers on every deploy.
- **Safety re-check in the worker** — the 15-minute window is a race condition surface. A user could re-enter after the job fires but before `cancelRoomDeletion` ran. The `getActiveUsers` check guards against deleting an occupied room.
- **Exponential backoff** — on Liveblocks API failure, BullMQ waits 5s → 10s → 20s before retrying (up to 3 attempts total).
- **Worker started as side-effect import** — `index.ts` uses `import "./workers/roomDeletion.worker"` — the `Worker` constructor starts listening on import, no explicit `.run()` call needed. Same pattern as `initializeWebSocketServer`.
- **Graceful shutdown** — `index.ts` handles `SIGTERM`/`SIGINT`: stops the HTTP server, then closes the worker, the queue and the app Redis connection in order, so in-flight deletions finish and BullMQ locks are released cleanly on redeploy.
- **Worker concurrency + reconnect resilience** — the worker runs with `concurrency: 5` and emits `ready` / `completed` / `failed` / `stalled` / `error` logs; Redis clients use capped reconnect backoff (max 5s) with `ready` / `close` / `reconnecting` / `end` lifecycle logs, so outages are visible in logs instead of silent.

