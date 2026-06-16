# Contributing to Session

Thanks for wanting to contribute! Here's everything you need to get involved.

---

## Ways to Contribute

| Type | How |
|------|-----|
| 🐛 **Bug Report** | [Open an issue](https://github.com/silky-x0/session/issues/new) with reproduction steps |
| 💡 **Feature Request** | Open an issue — describe the use-case, not just the solution |
| 📝 **Docs** | Edit files in `docs/` or the root `README.md` |
| 🔧 **Code** | Fork → branch → PR (see workflow below) |
| 🧪 **Tests** | Add tests in `*.test.tsx` files alongside components |

---

## Development Setup

See [README.md](../README.md#getting-started) for full prerequisites and install steps.

Quick summary:

```bash
git clone https://github.com/silky-x0/session.git
cd session

# Backend
cd backend && npm install && cp .env.example .env   # fill in your keys
npm run dev

# Frontend (new terminal)
cd frontend && npm install && cp .env.example .env  # fill in your keys
npm run dev
```

---

## Workflow

1. **Fork** the repo and clone your fork
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   # or
   git checkout -b fix/your-bug
   ```
3. **Make changes** — keep scope focused (one thing per PR)
4. **Verify locally:**
   ```bash
   # Frontend
   cd frontend && npm run lint && npm run build

   # Backend
   cd backend && npm run build
   ```
5. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add follow-me cursor mode
   fix: prevent duplicate room seeding on retry
   docs: update architecture diagram
   refactor: extract useYjsSync hook
   test: add SessionInput nickname validation tests
   ```
6. **Push** and **open a PR** — fill in the template, link any related issues

---

## PR Checklist

- [ ] Builds without errors (`npm run build`)
- [ ] Linting passes (`npm run lint`)
- [ ] Tested locally (both happy path and edge cases)
- [ ] Documentation updated if behavior changed
- [ ] Commits follow conventional format
- [ ] PR description clearly explains _what_ and _why_

---

## Code Style

- **TypeScript everywhere** — no `any` unless absolutely justified (leave a comment)
- **Functional components** — no class components
- **Hooks over HOCs** — prefer custom hooks for shared logic
- **Descriptive names** — `handleNicknameSubmit`, not `onClick2`
- **Comments explain _why_**, not _what_ — trust the types for the what
- **ESLint** — don't disable rules without a good reason

---

## Project-Specific Notes

- **Liveblocks hooks** (`useRoom`, `useStatus`, etc.) must be used **inside a `RoomProvider`**
- **`useStatus()`** is the correct hook for connection state — not `useRoom().status`
- **`BroadcastProvider`** must wrap any component that uses Liveblocks broadcast events
- **`Y.Map("meta")`** is the source of truth for problem metadata in the editor
- **Docker execution** requires the images to be pre-pulled on the host — the backend does not auto-pull
- **Liveblocks webhook route** uses `express.raw({ type: "application/json" })` — `req.body` is a raw `Buffer`, not parsed JSON. Always pass `req.body.toString()` to `webhookHandler.verifyRequest()`
- **BullMQ requires `maxRetriesPerRequest: null`** on the IORedis connection — omitting it causes BullMQ to throw on startup
- **Worker is started via side-effect import** in `index.ts` — never call `.run()` manually; the `Worker` constructor begins polling Redis automatically

---

## Need Help?

- Browse [open issues](https://github.com/silky-x0/session/issues) — look for `good first issue` labels
- Leave a comment in your PR or issue if you're stuck
- Check [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) to understand the system before diving in
