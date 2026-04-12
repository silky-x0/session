# Environment Variables

Both the backend and frontend require environment variables. **Never commit `.env` files** — they're in `.gitignore`.

---

## Backend — `backend/.env`

```bash
cp backend/.env.example backend/.env
```

```env
PORT="1234"
FRONTEND_URL="http://localhost:5173"
OPEN_ROUTER_KEY="sk-or-v1-..."
LIVEBLOCKS_SECRET_KEY="sk_..."
```

| Variable               | Required | Description                                            | Example                    |
|------------------------|----------|--------------------------------------------------------|----------------------------|
| `PORT`                 | ✅        | HTTP server port                                       | `1234`                     |
| `FRONTEND_URL`         | ✅        | Frontend origin — used in CORS allow-list              | `http://localhost:5173`    |
| `OPEN_ROUTER_KEY`      | ✅        | OpenRouter API key for AI problem generation & chat    | `sk-or-v1-...`             |
| `LIVEBLOCKS_SECRET_KEY`| ✅        | Liveblocks secret key for server-side room seeding     | `sk_prod_...`              |

---

## Frontend — `frontend/.env`

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:1234
VITE_LIVEBLOCKS_PUBLIC_KEY=pk_...
```

| Variable                     | Required | Description                                     | Example                   |
|------------------------------|----------|-------------------------------------------------|---------------------------|
| `VITE_API_URL`               | ✅        | Backend base URL for REST API calls             | `http://localhost:1234`   |
| `VITE_LIVEBLOCKS_PUBLIC_KEY` | ✅        | Liveblocks public key for client-side room auth | `pk_prod_...`             |

> **Note:** `VITE_WS_URL` from older versions is no longer needed — WebSocket is handled by Liveblocks directly.

---

## Production Notes

- Replace all `localhost` URLs with your deployed service URLs
- Use `https://` for `FRONTEND_URL` and `VITE_API_URL` in production
- Liveblocks keys: use `pk_prod_...` / `sk_prod_...` (not dev keys) for production
- Both Vercel and Render support setting env vars in their dashboards — do not use `.env` files on the server
