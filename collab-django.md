# Collaborative Code Editor - Django + TypeScript MVP

**Team:** 2 Django Devs + 2 MERN Devs + 1 AI/ML Dev  
**Timeline:** 48–72 hours  
**Date:** December 30, 2025

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Monaco Editor│  │   WebRTC     │  │  User List   │  │ AI Assistant │      │
│  │  + Yjs       │  │ Audio/Video  │  │  + Controls  │  │  (Optional)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘  └──────────────┘      │
└─────────┼─────────────────┼──────────────────────────────────────────────────┘
          │                 │
          │ WebSocket       │ WebRTC P2P
          │ (Yjs sync)      │
          ▼                 ▼
┌─────────────────────────────────────┐    HTTP/REST
│   REAL-TIME SERVER (Node.js)        │◄──────────────────┐
│   ┌─────────────────────────────┐   │                   │
│   │ y-websocket + Express       │   │                   │
│   │ • Yjs document sync         │   │                   │
│   │ • WebRTC signaling          │   │                   │
│   │ • Notifies Django on events │   │                   │
│   └─────────────────────────────┘   │                   │
│   (MERN Dev 1)                      │                   │
└─────────────────────────────────────┘                   │
                                                          │
┌─────────────────────────────────────────────────────────┴───────────────────┐
│                        DJANGO BACKEND                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Django REST Framework                                                 │ │
│  │  • Room CRUD APIs                                                      │ │
│  │  • User Management                                                     │ │
│  │  • Session Analytics                                                   │ │
│  │  • Admin Panel (built-in)                                              │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  AI Features (FastAPI sidecar or Django endpoint)                      │ │
│  │  • Code suggestions                                                    │ │
│  │  • Session summary generation                                          │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│  (Django Devs + AI/ML Dev)                                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │   PostgreSQL    │
          │   (or SQLite    │
          │   for MVP)      │
          └─────────────────┘
```

---

## Team Assignment

### 👨‍💻 MERN Dev 1 - Real-Time Server

| Task | Description | Hours |
|------|-------------|-------|
| Setup | Express + ws + y-websocket server | 2h |
| Yjs Sync | Document sync with room isolation | 3h |
| Signaling | WebRTC SDP/ICE relay | 3h |
| Django Integration | HTTP calls on join/leave | 2h |
| **Total** | | **10h** |

### 👨‍💻 MERN Dev 2 - Frontend

| Task | Description | Hours |
|------|-------------|-------|
| Setup | Vite + React + Tailwind | 1h |
| Home Page | Create/Join room UI | 2h |
| Room Page | Layout with editor + video | 2h |
| Monaco + Yjs | Editor with real-time sync | 4h |
| WebRTC | Audio/Video components | 5h |
| Polish | Responsive, error handling | 3h |
| **Total** | | **17h** |

### 🐍 Django Dev 1 - Core APIs

| Task | Description | Hours |
|------|-------------|-------|
| Setup | Django + DRF + PostgreSQL | 2h |
| Room Model | `Room` model + serializers | 2h |
| Room APIs | Create, Get, List, Delete | 3h |
| User Session | Track users in rooms | 3h |
| Cleanup Task | Celery task for stale rooms | 2h |
| **Total** | | **12h** |

### 🐍 Django Dev 2 - User Management + Admin

| Task | Description | Hours |
|------|-------------|-------|
| User Join/Leave | APIs for Node.js to call | 3h |
| Active Users | List users in room | 2h |
| Admin Panel | Customize Django admin | 2h |
| Analytics | Session duration, peak users | 3h |
| Testing | Unit tests for APIs | 2h |
| **Total** | | **12h** |

### 🤖 AI/ML Dev - Smart Features

| Task | Description | Hours |
|------|-------------|-------|
| Setup | FastAPI sidecar or Django endpoint | 2h |
| Code Suggestion | AI-powered autocomplete (Gemini/GPT) | 4h |
| Session Summary | Generate summary of coding session | 3h |
| Integration | Connect to frontend | 2h |
| **Total** | | **11h** |

---

## Data Models (Django)

```python
# rooms/models.py

from django.db import models
import uuid

class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    # Optional: store last code snapshot
    last_code_snapshot = models.TextField(blank=True, null=True)
    language = models.CharField(max_length=50, default='javascript')
    
    class Meta:
        ordering = ['-created_at']


class RoomUser(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='users')
    username = models.CharField(max_length=50)
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['joined_at']


class SessionAnalytics(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    peak_users = models.IntegerField(default=0)
    total_edits = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## API Endpoints (Django)

### Room Management

```
POST   /api/rooms/                 → Create room
GET    /api/rooms/                 → List active rooms
GET    /api/rooms/{id}/            → Get room details
DELETE /api/rooms/{id}/            → Delete room
```

### User Management (Called by Node.js server)

```
POST   /api/rooms/{id}/join/       → User joins room
       Body: { "username": "john" }
       Response: { "user_id": "...", "users": [...] }

POST   /api/rooms/{id}/leave/      → User leaves room
       Body: { "user_id": "..." }
       Response: { "success": true }

GET    /api/rooms/{id}/users/      → List active users
       Response: { "users": [...] }
```

### AI Features (Optional)

```
POST   /api/ai/suggest/            → Get code suggestion
       Body: { "code": "...", "cursor_position": 42 }
       Response: { "suggestion": "..." }

POST   /api/ai/summarize/          → Summarize session
       Body: { "room_id": "...", "code": "..." }
       Response: { "summary": "..." }
```

---

## Real-Time Server (Node.js)

```typescript
// src/index.ts
import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'
import * as Y from 'yjs'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

const DJANGO_API = process.env.DJANGO_API || 'http://localhost:8000'

// In-memory room documents
const rooms = new Map<string, { yDoc: Y.Doc, users: Map<string, any> }>()

wss.on('connection', (ws, req) => {
  const roomId = req.url?.split('/')[1] // /abc123
  let userId: string | null = null

  ws.on('message', async (data) => {
    const msg = JSON.parse(data.toString())

    if (msg.type === 'join') {
      userId = msg.userId
      
      // Notify Django
      await fetch(`${DJANGO_API}/api/rooms/${roomId}/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: msg.username })
      })

      // Initialize room if needed
      if (!rooms.has(roomId!)) {
        rooms.set(roomId!, { yDoc: new Y.Doc(), users: new Map() })
      }
      
      const room = rooms.get(roomId!)!
      room.users.set(userId, { ws, username: msg.username })

      // Send current state
      const state = Y.encodeStateAsUpdate(room.yDoc)
      ws.send(JSON.stringify({ type: 'sync', update: Array.from(state) }))
    }

    if (msg.type === 'yjs-update') {
      const room = rooms.get(roomId!)
      if (room) {
        const update = new Uint8Array(msg.update)
        Y.applyUpdate(room.yDoc, update)

        // Broadcast to others
        room.users.forEach((user) => {
          if (user.ws !== ws && user.ws.readyState === 1) {
            user.ws.send(JSON.stringify(msg))
          }
        })
      }
    }

    // WebRTC signaling
    if (['offer', 'answer', 'ice-candidate'].includes(msg.type)) {
      const room = rooms.get(roomId!)
      if (room && msg.targetId) {
        const target = room.users.get(msg.targetId)
        if (target) {
          target.ws.send(JSON.stringify({ ...msg, fromId: userId }))
        }
      }
    }
  })

  ws.on('close', async () => {
    if (roomId && userId) {
      // Notify Django
      await fetch(`${DJANGO_API}/api/rooms/${roomId}/leave/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      })

      const room = rooms.get(roomId)
      if (room) {
        room.users.delete(userId)
        if (room.users.size === 0) {
          rooms.delete(roomId)
        }
      }
    }
  })
})

server.listen(3001, () => console.log('Real-time server on :3001'))
```

---

## Frontend Key Components

### useYjs Hook
```typescript
// hooks/useYjs.ts
import { useEffect, useRef } from 'react'
import * as Y from 'yjs'

export function useYjs(roomId: string, username: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const yDocRef = useRef(new Y.Doc())

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3001/${roomId}`)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ 
        type: 'join', 
        userId: crypto.randomUUID(),
        username 
      }))
    }

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'sync' || msg.type === 'yjs-update') {
        Y.applyUpdate(yDocRef.current, new Uint8Array(msg.update))
      }
    }

    // Listen for local changes
    yDocRef.current.on('update', (update: Uint8Array) => {
      if (ws.readyState === 1) {
        ws.send(JSON.stringify({ 
          type: 'yjs-update', 
          update: Array.from(update) 
        }))
      }
    })

    return () => ws.close()
  }, [roomId, username])

  return { yDoc: yDocRef.current, ws: wsRef.current }
}
```

---

## AI/ML Feature: Code Suggestion

```python
# ai/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

@api_view(['POST'])
def suggest_code(request):
    code = request.data.get('code', '')
    language = request.data.get('language', 'javascript')
    
    prompt = f"""You are a code assistant. Given this {language} code, suggest the next logical line or completion. Only return the code, no explanation.

Code:
{code}

Suggestion:"""

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    return Response({'suggestion': response.text.strip()})


@api_view(['POST'])
def summarize_session(request):
    code = request.data.get('code', '')
    room_id = request.data.get('room_id', '')
    
    prompt = f"""Summarize what this code does in 2-3 sentences for a collaborative coding session:

{code}"""

    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content(prompt)
    
    return Response({
        'room_id': room_id,
        'summary': response.text.strip()
    })
```

---

## Project Structure

```
collab-editor/
│
├── frontend/                      # MERN Dev 2
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx
│   │   │   ├── VideoRoom.tsx
│   │   │   ├── UserList.tsx
│   │   │   └── AISuggestion.tsx
│   │   ├── hooks/
│   │   │   ├── useYjs.ts
│   │   │   ├── useWebRTC.ts
│   │   │   └── useAI.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── Room.tsx
│   │   └── api/
│   │       └── client.ts
│   ├── package.json
│   └── vite.config.ts
│
├── realtime-server/               # MERN Dev 1
│   ├── src/
│   │   ├── index.ts
│   │   └── signaling.ts
│   ├── package.json
│   └── tsconfig.json
│
└── django-backend/                # Django Devs + AI/ML Dev
    ├── config/
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    ├── rooms/
    │   ├── models.py
    │   ├── views.py
    │   ├── serializers.py
    │   ├── urls.py
    │   └── admin.py
    ├── ai/
    │   ├── views.py
    │   └── urls.py
    ├── manage.py
    └── requirements.txt
```

---

## Phase-by-Phase Roadmap

### Phase 1: Setup (Hours 0–6)
| Dev | Task |
|-----|------|
| MERN 1 | Setup realtime-server with Express + ws |
| MERN 2 | Setup frontend with Vite + React |
| Django 1 | Setup Django + DRF + models |
| Django 2 | Setup admin panel + user model |
| AI/ML | Research Gemini API, setup endpoint |

### Phase 2: Core Features (Hours 6–20)
| Dev | Task |
|-----|------|
| MERN 1 | Yjs sync, room isolation |
| MERN 2 | Monaco + Yjs binding |
| Django 1 | Room CRUD APIs |
| Django 2 | Join/Leave APIs |
| AI/ML | Code suggestion endpoint |

### Phase 3: Real-Time + Media (Hours 20–36)
| Dev | Task |
|-----|------|
| MERN 1 | WebRTC signaling |
| MERN 2 | Video/Audio components |
| Django 1 | Celery room cleanup |
| Django 2 | Analytics endpoints |
| AI/ML | Session summary feature |

### Phase 4: Integration + Deploy (Hours 36–48)
| Dev | Task |
|-----|------|
| MERN 1 | Connect to Django APIs |
| MERN 2 | Polish UI, error handling |
| Django 1 | Production settings |
| Django 2 | Deploy to Railway |
| AI/ML | Integrate AI into frontend |

---

## Deployment

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend | Vercel | Free |
| Real-Time Server | Railway | ~$5/mo |
| Django Backend | Railway | ~$5/mo |
| PostgreSQL | Railway | ~$5/mo |
| **Total** | | **~$15/mo** |

---

## Environment Variables

### Frontend (.env)
```
VITE_REALTIME_URL=wss://realtime.yourapp.com
VITE_DJANGO_URL=https://api.yourapp.com
```

### Real-Time Server (.env)
```
PORT=3001
DJANGO_API=http://localhost:8000
```

### Django (.env)
```
SECRET_KEY=your-secret-key
DEBUG=False
DATABASE_URL=postgres://...
GEMINI_API_KEY=your-gemini-key
ALLOWED_HOSTS=api.yourapp.com
```

---

## Quick Start

```bash
# Terminal 1: Django
cd django-backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

# Terminal 2: Real-time Server
cd realtime-server
npm install
npm run dev

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

---

## Success Criteria

- [ ] User can create room and get shareable link
- [ ] 2+ users can edit code simultaneously
- [ ] Changes sync in < 500ms
- [ ] Audio/Video works between peers
- [ ] AI suggestions appear on request
- [ ] Room auto-deletes after 30 min of inactivity
