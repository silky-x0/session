# Architecture

## Overview

Session is a full-stack monorepo with a React frontend and a Node.js/Express backend. Real-time collaboration is handled by **Liveblocks** (cloud CRDT/presence) + **Yjs** (conflict-free document model), and isolated code execution runs inside ephemeral **Docker** containers.

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
│   │ (AI codegen  │  │ (AI chat via │  │ (Docker runner)│  │
│   │  + LB seed)  │  │  OpenRouter) │  │                │  │
│   └──────────────┘  └──────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │    Docker Engine (host)      │
              │  python:3.11-alpine          │
              │  node:20-alpine              │
              │  gcc:latest                  │
              └─────────────────────────────┘
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
                                          ├── CodeEditor (Monaco)
                                          ├── AIChat
                                          ├── OutputPanel
                                          ├── LiveCursors
                                          ├── ConnectionToast
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
  → Express Router (routes/)
    → Controller (controllers/)
      → Service (services/)
        → External API / Docker / Liveblocks Node SDK
          → Response
```

### Layered Design

```
backend/src/
├── index.ts                  ← server entry, port bind
├── app.ts                    ← Express app, middleware, routes
├── config/
│   ├── env.ts                ← all env vars + CORS config
│   └── kimi2thinking.ts      ← Kimi AI model config
├── controllers/
│   ├── session.controller.ts ← POST /api/session
│   ├── aichat.controller.ts  ← POST /api/chat
│   └── execute.controller.ts ← POST /api/execute
├── middleware/
│   ├── errorHandler.ts       ← global error handler
│   └── asyncHandler.ts       ← wraps async route handlers
├── routes/
│   ├── ai.routes.ts          ← /api/session, /api/chat
│   └── code.routes.ts        ← /api/execute
├── services/
│   ├── session.service.ts    ← AI problem gen → Liveblocks seed
│   ├── liveblocks.service.ts ← Liveblocks Node SDK wrapper
│   ├── aichat.service.ts     ← streaming AI chat
│   ├── execute.service.ts    ← Docker container lifecycle
│   └── yjs.service.ts        ← (legacy) in-memory Yjs store
└── utils/
    └── languageMapper.ts     ← maps language names → Docker images
```

### Session Bootstrap Flow

When a user clicks **"Start Session"** with AI generation enabled:

```
1. Frontend POSTs to /api/session  { topic?, language }
2. session.service.ts calls the AI model (Kimi/OpenRouter)
3. AI returns: title, difficulty, question, hints, starterCode, fullSolution
4. liveblocks.service.ts seeds the Liveblocks room via Node SDK:
     - yDoc.getMap("meta").set(...)      ← problem metadata
     - yDoc.getText("monaco").insert()   ← starter code
5. Backend returns { roomId, ... } to the frontend
6. Frontend navigates to /editor?room=<roomId>&nickname=<name>
7. RouteTransition overlay stays until useStatus() === "connected"
```

---

## Real-Time Collaboration

### Yjs + Liveblocks

- **`Y.Text("monaco")`** — the shared code document, bound to Monaco via `MonacoBinding`
- **`Y.Map("meta")`** — shared metadata (title, difficulty, language, hints, solution)
- **`Y.Array("output")`** — shared execution output visible to all collaborators
- **`Y.Map("execution")`** — distributed lock to prevent concurrent execution
- **Awareness** — user cursor position, color, and nickname synced via Liveblocks presence

### Presence Shape

```ts
// liveblocks.config.ts
type Presence = {
  cursor: { x: number; y: number } | null;
  isTyping: boolean;
  selectedLineNumber: number | null;
  info: { name: string; color: string };
};
```

---

## Code Execution Pipeline

```
User clicks "Run"
  → OutputPanel sends Liveblocks broadcast "execute"
    → BroadcastProvider receives broadcast
      → POST /api/execute  { code, language }
        → execute.service.ts
          → docker.run(image, code)   ← ephemeral container
            → stream stdout/stderr    ← demultiplexed
              → response chunks
                → Y.Array("output").push(...)   ← synced to all users
```

<br>

> The diagram below illustrates the full Docker execution lifecycle — from the browser "Run" click, through the Express backend, to the ephemeral container and back.


<br>

![Docker Execution Service Diagram](../frontend/public/exec-backend.excalidraw.png)

### Container Constraints

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

> **Planned**: Execution queue to throttle concurrent container requests and prevent host resource exhaustion.

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
| `config/redis.ts` | Shared IORedis connection (`maxRetriesPerRequest: null` required by BullMQ) |

### Deletion Flow

```
Liveblocks → POST /webhook
  → verifyLiveblocksWebhook (HMAC check)
    → handleWebhook (event type dispatcher)

[userLeft, numActiveUsers === 0]
  → scheduleRoomDeletion(roomId, 15min)
    → BullMQ: queue.add(roomId, { roomId }, { jobId: roomId, delay: 15min, attempts: 3 })
      → Job persisted in Redis (survives server restarts)

[userEntered]
  → cancelRoomDeletion(roomId)
    → BullMQ: queue.remove(roomId)  ← no-op if job already fired/gone

[Job fires after 15min delay]
  → roomDeletion.worker.ts processor
    → liveblocks.getActiveUsers(roomId)
      → if users present → abort (log DELETION_ABORTED)
      → if empty → liveblocks.deleteRoom(roomId)
        → success: log DELETION_SUCCESS
        → failure: re-throw → BullMQ retries (3x, exponential backoff: 5s base)
```

### Key Design Decisions

- **Idempotency via `jobId: roomId`** — BullMQ silently rejects a second `queue.add()` with the same `jobId` if the job is still pending. Safe to call `scheduleRoomDeletion` multiple times for the same room.
- **Redis persistence** — delayed jobs survive backend restarts. A `setTimeout` alternative would lose all pending timers on every deploy.
- **Safety re-check in the worker** — the 15-minute window is a race condition surface. A user could re-enter after the job fires but before `cancelRoomDeletion` ran. The `getActiveUsers` check guards against deleting an occupied room.
- **Exponential backoff** — on Liveblocks API failure, BullMQ waits 5s → 10s → 20s before retrying (up to 3 attempts total).
- **Worker started as side-effect import** — `index.ts` uses `import "./workers/roomDeletion.worker"` — the `Worker` constructor starts listening on import, no explicit `.run()` call needed. Same pattern as `initializeWebSocketServer`.

