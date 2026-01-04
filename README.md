<div align="center">
  <img src="frontend/public/session-logo-ascii-white.svg" alt="Session ASCII Art" width="550" />
  
  <p>
    Get 10X more out of your pair programming sessions.
  </p>

  <p>
    <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build" />
    <img src="https://img.shields.io/badge/typescript-v5.0-blue" alt="TypeScript" />
    <img src="https://img.shields.io/badge/license-MIT-orange" alt="License" />
  </p>
  
  <br />
<hr />
<br/>
  <br/>
  <br/>

  <img src="frontend/public/session-landing.png" alt="Session Landing Page" width="100%" />
  <br/>
  <br/>
  <br/>
</div>

Session is a real-time collaborative coding environment built for pair programming, interviews, and focused technical discussions — with audio, video, and live execution.

## Project Structure

- **frontend/**: React application (Vite + Tailwind CSS v4).
- **backend/simple-ws-server/**: Node.js WebSocket server using Yjs for real-time synchronization.

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
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

## Deployment

### Production URLs

- **Frontend**: https://mock-collab-editor.onrender.com

### Deployment Configuration

**Backend (Render)**

- Root Directory: `backend/simple-ws-server`
- Build Command: `npm install`
- Start Command: `npm start`

**Frontend (Render)**

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run preview` (or serve `dist` folder)
- Environment Variable: `VITE_WS_URL=ws://localhost:1234`
