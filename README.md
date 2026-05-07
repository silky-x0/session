<div align="center">
  <img src="frontend/public/session-logo-ascii-white.svg" alt="Session Logo" width="550" />
  
  <br />
  <br />
  
  <h3>the coding room that thinks with you</h3>
  
  <p>Stop juggling tabs. Session gives interviewers and engineers a shared live IDE, AI-generated questions tuned to experience level, audio &amp; video, and post-session analysis — all from a single link. No setup. No credit card.</p>

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

| Category | What's Included |
|---|---|
| **Real-Time Collaboration** | Live code sync via Yjs + Liveblocks, Monaco Editor (VS Code engine), multi-language support, live cursors & selections with user colors |
| **AI Assistance** | AI-generated questions tuned to experience level, integrated AI chat panel, session bootstrap (problem + starter code), powered by OpenRouter (Kimi model) |
| **Code Execution** | Docker-isolated execution for Python, JavaScript, C, C++ — shared output synced to all collaborators |
| **Interview Mode** | Problem panel with difficulty, hints system, complexity display, solution reveal, post-session analysis |
| **Audio & Video** | Built-in audio & video calls so interviewers and candidates share one room — no Zoom, no context switch |
| **Premium UI/UX** | Deep Carbon & Neon Pulse design system, glassmorphism, JetBrains Mono, Framer Motion transitions, route-aware shutter animations |
| **Presence** | Avatar stack, live cursors, sync status badge, connection loss toasts |
| **Coming Soon** | Excalidraw whiteboard, follow-me cursor, execution queue |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework with concurrent features |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **Tailwind CSS v4** | Utility-first styling |
| **Liveblocks** | Real-time presence, CRDT sync, broadcast |
| **Monaco Editor** | VS Code-grade editor |
| **Yjs + y-monaco** | Conflict-free collaborative document |
| **Framer Motion** | Animations and route transitions |
| **React Router v7** | Client-side routing |

### Backend

| Technology | Purpose |
|---|---|
| **Node.js + Express** | HTTP server with layered routing |
| **TypeScript** | Type-safe server code |
| **Liveblocks Node SDK** | Server-side room seeding |
| **OpenRouter SDK** | AI model access (Kimi, etc.) |
| **Docker SDK** | Ephemeral code execution containers |

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
│       ├── config/               # env.ts, kimi2thinking.ts
│       ├── controllers/          # session, aichat, execute
│       ├── middleware/           # errorHandler, asyncHandler
│       ├── routes/               # ai.routes.ts, code.routes.ts
│       ├── services/             # session, liveblocks, aichat, execute, yjs
│       └── utils/                # languageMapper
│
├── docs/
│   ├── ARCHITECTURE.md           # System design, data flow diagrams
│   ├── CONTRIBUTING.md           # Workflow, code style, project-specific notes
│   ├── DEPLOYMENT.md             # Vercel + Render setup
│   └── ENV_VARS.md               # All environment variables reference
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm**
- **Docker** (required for code execution feature)
- A **Liveblocks** account (free) — get your keys at [liveblocks.io](https://liveblocks.io)
- An **OpenRouter** API key — [openrouter.ai](https://openrouter.ai)

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

# Pull Docker images for code execution
docker pull python:3.11-alpine
docker pull node:20-alpine
docker pull gcc:latest
```

### Running Locally

```bash
# Terminal 1 — Backend (http://localhost:1234)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

Open `http://localhost:5173`, click **"Start Session"**, share the URL — done.

---

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, component tree, data flow, Yjs/Liveblocks internals, execution pipeline |
| [docs/ENV_VARS.md](docs/ENV_VARS.md) | Every environment variable for backend and frontend |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Render + Vercel deployment instructions |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | PR workflow, code style, project-specific gotchas |

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <br />
  <p>
    <strong>Built with ♥ by the Session Contributors</strong>
  </p>
  <p>
    <a href="https://session-ecru.vercel.app/">Website</a>
    •
    <a href="https://github.com/silky-x0/session/issues">Report Bug</a>
    •
    <a href="https://github.com/silky-x0/session/issues">Request Feature</a>
  </p>
  <br />
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
