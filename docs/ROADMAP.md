# Roadmap & Backlog

Items here are tracked loosely. For structured feature planning per mode, see `features.md`.

## In Progress

### Session & Request Validation

- [ ] Understand token-based authorization flow (`Authorization: Bearer <token>` header)
- [ ] Decide on session validation approach (Room Session Token vs. User Auth)
- [ ] Create `validateSessionToken` middleware to verify incoming requests
- [ ] Validate request body payload sizes (e.g., limit code execution string length to 20 KB)

### Verification & Testing

- [ ] Test rate limiting with HTTP requests to confirm `429 Too Many Requests` response
- [ ] Confirm `Retry-After` headers are correctly sent to clients
- [ ] Verify frontend handles rate limit responses gracefully (e.g., displaying user toast notifications)

## Completed

- [x] Ephemeral room deletion — BullMQ + Redis delayed jobs, Liveblocks webhook integration, idempotent scheduling, safety re-check in worker
- [x] Fix AI chat output sync with collaborators
- [x] Add execution queue to throttle concurrent Docker requests (prevent host resource exhaustion)
- [x] Switch primary execution engine to JDoodle API — eliminates host Docker dependency, enables zero-friction deployment on Render/Vercel/Railway
- [x] Redis-backed Token Bucket rate limiting — replaces fixed-window; constant memory footprint, immediate 429 on exhaustion, protects JDoodle/Gemini/OpenRouter paid credits
- [x] Dual-key (compound key) rate limiting — per-IP global tier + per-(IP+Room) room tier; prevents shared-network (NAT) users from blocking each other, closes multi-room bypass
- [x] Excalidraw whiteboard integration
- [x] Theme system (Light / Dark / High Contrast / Zen Mode)
- [x] Prettier integration ("Format Code" button)
- [x] Recent sessions list on landing page
- [x] Performance metrics (execution time, memory usage graphs)
- [x] Driver/Navigator indicator toggle

## Planned

- [ ] Orphaned room cron job — delete rooms that were created but never joined
- [ ] WebRTC audio/video calls (WebRTC peer-to-peer)
- [ ] "Follow me" cursor mode (click avatar → viewport tracks them)
- [ ] Execution queue with cancellation
- [ ] Inline code comments (Google Docs-style, per-line)
- [ ] Interview mode: private notes panel (interviewer only)
- [ ] Session playback (keystroke-by-keystroke replay)

## Ideas / Exploratory

- [ ] Snippet library / personal scratchpad
- [ ] Attention pings (visual ripple on a line to draw partner's focus)

---

_Last updated: August 2026_
