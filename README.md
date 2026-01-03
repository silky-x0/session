# Real-time Collaboration Editor

This repository contains a real-time collaborative text editor consisting of a React frontend and a Node.js WebSocket backend.

## Project Structure

- **frontend/**: React application powered by Vite.
- **backend/simple-ws-server/**: Node.js WebSocket server using Yjs for real-time state synchronization.

## Getting Started

### Prerequisites

- Node.js and npm installed.

### Backend

1. Navigate to the server directory:
   ```bash
   cd backend/simple-ws-server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server listens on port `1234` by default.

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend/vite-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the local URL (e.g., `http://localhost:5173`).

## Deployment Notes

### Production URLs
- **Frontend**: https://mock-collab-editor.onrender.com
- **Backend**: https://collab-editor-flc9.onrender.com

### Render (Backend)

To deploy the backend on Render:
1. Ensure the server listens on `process.env.PORT`.
2. Set the "Build Command" to `npm install`.
3. Set the "Start Command" to `npm start`.

### Render (Frontend)

To deploy the frontend on Render:
1. Set the "Build Command" to `npm install && npm run build`.
2. Set the "Start Command" to `npm start`.
3. Add environment variable: `VITE_WS_URL=wss://collab-editor-flc9.onrender.com`.
4. Redeploy after setting the environment variable (Vite bakes env vars at build time).
