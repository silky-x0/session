# Roadmap & Backlog

Items here are tracked loosely. For structured feature planning per mode, see `features.md`.

## In Progress

### Verification & Testing

- [ ] Test rate limiting with HTTP requests to confirm `429 Too Many Requests` response
- [ ] Confirm `Retry-After` headers are correctly sent to clients
- [ ] Verify frontend handles rate limit responses gracefully (e.g., displaying user toast notifications)

_No automated coverage yet — `backend/tests/integration/` only covers session-token auth (`auth.test.ts`) and AI chat happy-path (`api.test.ts`); no `429` / `Retry-After` assertions._

### UI/UX polish follow-ups (`UI/UX-chnages` branch)

- [ ] Merge / close out landing + editor + video-call polish (press states, skeletons, error-only toasts, fonts, `dvh`, touch defaults)
- [ ] Decide fate of untracked `docs/design/` + root `multi-question-flow.md` (promote into `docs/` or delete)

## Completed

### Auth, validation & rate limiting

- [x] Session & request validation — **Room Session Tokens chosen over User Auth** (login-less product): backend mints short-lived HS256 JWTs bound to a `roomId` (`POST /api/sessions/:roomId/token`); `validateSessionToken` middleware guards `/api/code/*`, `/api/ai/chat`, and `POST /api/ai/session/generate-remaining` + `POST /livekit/token` with `Authorization: Bearer` (401 invalid/expired, 403 room mismatch); frontend mints/caches per-room tokens in `lib/apiClient.ts` with transparent re-mint on 401; payload caps — 20 KB code, 10 KB stdin, 8 KB prompt, 512 KB global body → 413; rate limiter now fails open fast when Redis is unreachable instead of hanging

- [x] Redis-backed Token Bucket rate limiting — replaces fixed-window; constant memory footprint, immediate 429 on exhaustion, protects JDoodle/Gemini/OpenRouter paid credits
- [x] Dual-key (compound key) rate limiting — per-IP global tier + per-(IP+Room) room tier; prevents shared-network (NAT) users from blocking each other, closes multi-room bypass

### Room deletion / cleanup jobs

- [x] Ephemeral room deletion — BullMQ + Redis delayed jobs, Liveblocks webhook integration (`userLeft` → `scheduleRoomDeletion` 15 min, `userEntered` → `cancelRoomDeletion`), idempotent scheduling (`jobId: roomId`), safety re-check in worker
- [x] Orphaned room cleanup — covers rooms created but never joined via the same BullMQ delayed-job flow (stale-job clear + bounded retention + `GET /health` Redis status + graceful shutdown); no separate `node-cron` daemon — deletion is job-based, not cron-based
- [x] Redis / queue / worker resilience — `createRedisConnection` factory (dedicated `app` / `queue` / `worker` clients, TLS via `rediss://`, capped reconnect backoff), 5s fail-fast ops, stale-job reschedule, bounded retention, webhook fail-open on Redis outage, graceful shutdown (HTTP → worker → queue → Redis)

### Execution (JDoodle primary)

- [x] Switch primary execution engine to JDoodle API — eliminates host Docker dependency, enables zero-friction deployment on Render/Vercel/Railway
- [x] Execution hardening — code sanitization before run, JS/TS treated as isolated modules, multi-testcase parallel execution with stdin + output classification, expanded language map (`languageMapper.ts`)
- [x] ~~Add execution queue to throttle concurrent Docker requests~~ — **superseded / removed**: `execute.service.ts` is JDoodle-only, no Docker runner in code; host-queue rationale no longer applies (see `ARCHITECTURE.md` Docker flow marked design-only)

### AI interview engine — multi-question flow (done, Sep 2026)

- [x] 1-prompt → 5-question set — Q1 generates inline, Q2–Q5 generate sequentially in background after workspace entry (`POST /api/ai/session/generate-remaining` → 202 fire-and-forget, `questionGenerator.service.ts` with 2× auto-retry + backoff, `error` slot + manual Retry via `startFromIndex`)
- [x] Prompt intelligence — heuristic-first `promptClassifier.ts` (`problem` vs `profile`) with AI fallback + `buildFollowUpPrompt()` templates (dedupe via `previousTitles`, domain rotation for profiles, same-language lock for `problem` mode)
- [x] Per-question collab state — `Y.Array("questions")` slots (`pending`/`generating`/`ready`/`error`) + `Y.Text("monaco-q{n}")` buffers with delta-patch writes (`patchLiveblocksQuestionSlot`), `Y.Text("monaco")` retired with single-question fallback
- [x] QuestionSidebar browser — 5-slot list (spinner/tooltip for pending, retry for errors), per-row hints/solution accordions, presence avatar dots via `currentQuestionIndex`, single Monaco instance rebind on switch, double-trigger guard (`pending` check + `execution.queueStarted`)
- [x] AI chat collaboration — storage moved localStorage → Yjs, multi-user typing indicators, mobile fix to read code from Yjs source-of-truth for Run + AI chat

### Real-time calls & presence

- [x] LiveKit audio/video calls (supersedes raw WebRTC plan) — SFU tokens via `POST /livekit/token` (room-bound), `neoVideoCall` → `video-call/` feature folder (hooks/components), participant pinning, fullscreen/grid layouts, screenshare autofocus, drag threshold, joining/retry/error states, press states + touch targets
- [x] Presence & sync UX — roster/live cursors/typing indicators/sync badge/disconnect notice, performance metrics synced via Yjs, guard against accidental loading-screen dismissal

### Editor, whiteboard & metrics

- [x] Excalidraw whiteboard integration — Yjs-synced (`Y.Text("whiteboard")`) shared board
- [x] Theme system (Light / Dark / High Contrast / Zen Mode)
- [x] Prettier integration ("Format Code" button)
- [x] Performance metrics (execution time, memory usage graphs) — `metrics/` card (`ExecutionTimeChart`, `MemoryUsageChart`, `RuntimeComparison`) + Yjs sync + default fallback states
- [x] Editor hardening — single editor instance hosted in problem drawer, per-question slot rebind with fade transition, `ProblemPanel` optional-metadata children, `CodeEditor` unmount notify, sidebar skeletons, error-only toasts, press states, `RouteTransition` overlay until Liveblocks `connected`
- [x] Landing + perf/a11y — self-hosted fonts, `prefers-reduced-motion` base, `dvh` units, touch defaults, hero tightening, micro-interactions, footer marquee removal, keyboard navigation + screen-reader output logs
- [x] Docs & automation — `ARCHITECTURE.md` / `DEPLOYMENT.md` / `ENV_VARS.md` / `README.md` rewrite (interview-first positioning), Robin code-review agent (`.github/workflows/robin.yml`), `QuestionSidebar` / `SessionInput` / `Hero` tests

### Corrected entries (were marked done, aren't)

- [ ] _Moved back to Planned:_ Driver/Navigator indicator toggle — only a color token in `DESIGN_SYSTEM.md`, no toggle/status implementation in `Editor.tsx` / `TopBar.tsx`
- [ ] _Partially reverted:_ Recent sessions list on landing page — removed Jul 2026 (`refactor: removed recent history temporarily`); `SessionInput.tsx` still writes `localStorage: session-history` but renders no list

## Planned

- [ ] Driver/Navigator indicator toggle — explicit driving-vs-guiding status (see correction above)
- [ ] Restore Recent Sessions list UI (or drop the `localStorage` write if intentionally removed)
- [ ] "Follow me" cursor mode (click avatar → viewport tracks them)
- [ ] Execution queue with cancellation (for JDoodle concurrency, not Docker)
- [ ] Inline code comments (Google Docs-style, per-line)
- [ ] Interview mode: private notes panel (interviewer only)
- [ ] Session playback (keystroke-by-keystroke replay)
- [ ] Multi-question follow-ups (from `multi-question-flow.md` §11 + §9): retire-vs-keep `ProblemPanel` decision, difficulty curve for Q5 in `profile` mode, server-boot sweep for stalled `generating` slots

## Ideas / Exploratory

- [ ] Snippet library / personal scratchpad
- [ ] Attention pings (visual ripple on a line to draw partner's focus)
- [ ] Sandbox snapshots (save/restore state) — see `features.md` §2
- [ ] Interviewer scorecard + hidden test cases + problem selector + focus timer — see `features.md` §4

---

_Last updated: October 2026_
