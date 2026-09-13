<div align="center">
  <img src="frontend/public/session-logo-ascii-white.svg" alt="Session Logo" width="550" />
  
  <br />
  <br />
  
  <h3>the coding room that thinks with you</h3>
  
  <p>Session is for live coding interviews and pair programming. You share one link and get a shared editor, AI made questions, audio and video, plus a whiteboard. Nothing to install.</p>

  <br />

  <p>
    <a href="https://session-ecru.vercel.app/"><img src="https://img.shields.io/badge/_Live_Demo-Session-26A65B?style=for-the-badge&labelColor=0a0a0a" alt="Live Demo" /></a>
    <img src="https://img.shields.io/badge/Build-Passing-26A65B?style=for-the-badge&labelColor=0a0a0a" alt="Build" />
    <img src="https://img.shields.io/badge/TypeScript-v5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white&labelColor=0a0a0a" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=0a0a0a" alt="React" />
    <img src="https://img.shields.io/badge/License-MIT-F97316?style=for-the-badge&labelColor=0a0a0a" alt="License" />
  </p>

  <br />
  <hr />
  <br />

  <img src="frontend/public/session-landing.png" alt="Session Landing Page Preview" width="100%" style="border-radius: 12px;" />
  
  <br />
  <br />
</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [License](#license)

---

## Features

| Category | What you get |
|---|---|
| **Live editing** | Same file, multiple people. Live cursors with colors. Monaco under the hood (same editor VS Code uses), synced with Yjs and Liveblocks. Works across languages. |
| **AI questions** | Type a topic or role on the home page and it puts together an interview question with starter code, hints, and a difficulty level, then loads it into your room. There is also a chat panel inside the editor. Runs on Gemini by default, or OpenRouter if you set `AI_PROVIDER`. |
| **Run code** | Code runs through JDoodle. Everyone in the room sees the same output. |
| **Interview view** | Question panel with difficulty, hints, time and space notes, and a solution reveal when you need it. |
| **Calls built in** | Audio and video right inside the room, so you do not have to juggle Zoom alongside it. |
| **Whiteboard** | Shared Excalidraw board. Good for sketching out an approach together. |
| **Rate limiting** | Redis token bucket, keyed by IP and room. Old keys expire on their own. If Redis goes down, requests still pass through. |
| **UI** | Dark theme, JetBrains Mono, some light motion between routes. Meant to stay out of the way. |
| **Presence** | See who is in the room, where they are typing, and whether you are synced. You get a notice if the connection drops. |
| **Still to do** | Follow mode, inline comments, session playback. |

---

## Tech Stack

### Frontend

| Technology | What it is for |
|---|---|
| **React 19** | UI |
| **TypeScript** | Types |
| **Vite** | Dev server and builds |
| **Tailwind CSS v4** | Styling |
| **Liveblocks** | Presence and room sync |
| **Monaco Editor** | Code editor |
| **LiveKit Client** | Audio and video in the browser |
| **Yjs + y-monaco** | Keeps editor text in sync between people |
| **Framer Motion** | Small animations and page transitions |
| **React Router v7** | Routing |

### Backend

| Technology | What it is for |
|---|---|
| **Node.js + Express** | API server |
| **TypeScript** | Types on the server |
| **Liveblocks Node SDK** | Creates rooms and handles webhooks |
| **LiveKit Server SDK** | Call tokens and room setup |
| **Gemini / OpenRouter SDK** | AI questions and chat. Picked with `AI_PROVIDER` |
| **JDoodle API** | Runs user code, so no Docker setup needed |
| **Redis + ioredis** | Stores rate limit counts and queued jobs |
| **BullMQ** | Deletes old rooms after a delay |

---

## Project Structure

```
session/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── editor/           # Monaco, TopBar, AIChat, OutputPanel,
│       │   │                     # LiveCursors, AvatarStack, ConnectionToast,
│       │   │                     # BroadcastProvider, NotificationsPanel...
│       │   ├── landing/          # Hero, SessionInput, SessionLoadingScreen,
│       │   │                     # Header, Marquee, EditorShowcase,
│       │   │                     # GeneratorSection, TypographyBreak,
│       │   │                     # FeatureGallery, CinematicFooter...
│       │   ├── ui/               # hero-shutter-text, weave-spinner, link-preview
│       │   ├── Editor.tsx        # RoomProvider + CollaborativeEditorInner
│       │   └── RouteTransition.tsx
│       ├── hooks/                # useRoomSettings
│       ├── utils/                # getContrastingColor, useBoundingClientRectRef
│       ├── liveblocks.config.ts  # Presence/Storage types
│       ├── App.tsx               # Routes + editorReady state
│       └── index.css             # Design tokens, global styles
│
├── backend/
│   └── src/
│       ├── config/               # env, redis, liveblock, AI providers
│       ├── controllers/          # session, aichat, execute, webhook (userentered/userleft), livekit
│       ├── middleware/           # errorHandler, asyncHandler, rateLimiter, auth, session tokens
│       ├── queues/               # roomDeletion queue (BullMQ scheduling)
│       ├── workers/              # roomDeletion worker (delayed cleanup)
│       ├── websocket/            # socket server
│       ├── routes/               # ai, code, session, livekit, webhook
│       ├── services/             # session, liveblocks, aichat, execute (JDoodle), yjs, livekit, tokens
│       └── utils/                # languageMapper, payloadLimits
│
├── docs/
│   ├── ARCHITECTURE.md           # System design, data flow, rate limiting, execution pipeline
│   ├── ROADMAP.md                # Completed, in-progress, and planned features
│   ├── CONTRIBUTING.md           # Workflow, code style, project-specific notes
│   ├── DEPLOYMENT.md             # Vercel + Render setup
│   └── ENV_VARS.md               # All environment variables reference
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **Liveblocks** account (free). Keys are at [liveblocks.io](https://liveblocks.io)
- A **JDoodle** account for running code. Free tier is fine: [jdoodle.com](https://jdoodle.com)
- A **Gemini** key from [aistudio.google.com](https://aistudio.google.com). Or use OpenRouter by setting `AI_PROVIDER=openrouter` with a key from [openrouter.ai](https://openrouter.ai)
- A **LiveKit Cloud** project (free) if you want calls: [cloud.livekit.io](https://cloud.livekit.io)
- A **Redis** instance for rate limits and cleanup jobs. The free tier at [Redis Cloud](https://redis.io/try-free/) is enough.

### Installation

```bash
git clone https://github.com/silky-x0/session.git
cd session

# Backend
cd backend
npm install
cp .env.example .env    # then fill in your keys

# Frontend
cd ../frontend
npm install
cp .env.example .env    # then fill in your keys
```



### Running Locally

```bash
# Terminal 1: backend at http://localhost:1234
cd backend && npm run dev

# Terminal 2: frontend at http://localhost:5173
cd frontend && npm run dev
```

Open `http://localhost:5173`, type a topic or leave it blank, hit **"Start Session"**, and send the link to whoever is joining.

---

## Documentation

| Doc | What is in it |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the pieces fit together, how data flows, how rate limiting and code runs work |
| [docs/ROADMAP.md](docs/ROADMAP.md) | What is done, what is being worked on, what is planned |
| [docs/ENV_VARS.md](docs/ENV_VARS.md) | Every env var for backend and frontend |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | How to deploy on Render and Vercel |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | How to send a PR and what to watch out for in this repo |

---

## License

MIT. See [LICENSE](LICENSE).

---

<div align="center">
  <br />
  <p>
    <strong>Built by the Session contributors</strong>
  </p>
  <p>
    <a href="https://session-ecru.vercel.app/">Website</a>
    •
    <a href="https://github.com/silky-x0/session/issues">Report Bug</a>
    •
    <a href="https://github.com/silky-x0/session/issues">Request Feature</a>
  </p>
  <br />
  <p>If you tried it and found it useful, a star helps.</p>
</div>
