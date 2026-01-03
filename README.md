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

### Render (Backend)

To deploy the backend on Render:
1. Ensure the server listens on `process.env.PORT`.
2. Set the "Build Command" to `npm install`.
3. Set the "Start Command" to `npm start`.
