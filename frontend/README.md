# Session

Session is a collaborative code editor in the browser. Open a room, share the link, and write code together — with audio/video chat built in.

It's still early. The landing page and editor work, collaboration works via Liveblocks + Yjs, calls run on LiveKit.

## What it does

- Shared Monaco editor (multiple people, same file, live cursors)
- Whiteboard via Excalidraw
- Audio/video via LiveKit
- Landing page at `/`, editor at `/editor?room=your-room-name`

## Stack

React + TypeScript + Vite. Tailwind v4 for styling. Monaco for the editor, Yjs + Liveblocks for sync, LiveKit for calls.

## Run it locally

You need Node 20+.

```bash
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:5173.

You'll need keys for this to actually work together:

- `VITE_LIVEBLOCKS_PUBLIC_KEY` — from Liveblocks
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` — from LiveKit
- `VITE_API_URL` / `VITE_WS_URL` — backend, defaults to localhost:1234

Without those, the UI loads but rooms/calls won't connect.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — typecheck + production build
- `npm run test` — unit tests (Vitest)
- `npm run test:e2e` — e2e tests (Playwright)
- `npm run lint` — eslint
