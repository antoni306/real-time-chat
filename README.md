# Real-Time Chat

A full-stack real-time chat application with JWT authentication, direct and group conversations, and live messaging over WebSockets.

## Demo

<!-- Drag & drop the demo video here in the GitHub editor to embed it inline -->

## Tech Stack

**Backend**

- NestJS (TypeScript)
- Socket.IO (WebSocket gateway)
- PostgreSQL + TypeORM (with migrations)
- Passport + JWT (access & refresh tokens)
- bcrypt for password hashing

**Frontend**

- React 19 + Vite
- React Router
- socket.io-client

**Infrastructure**

- Docker Compose (PostgreSQL, Redis)

## Features

- User registration and login
- JWT authentication with refresh tokens and logout
- Direct (1-on-1) and group conversations
- Real-time messaging with Socket.IO
- Message history stored in PostgreSQL
- WebSocket connections protected by JWT guard

## Project Structure

```
├── backend/     # NestJS API + WebSocket gateway
├── frontend/    # React app (Vite)
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js
- Docker & Docker Compose

### 1. Environment variables

Create a `.env` file in the project root (used by Docker Compose and the backend):

```env
PORT=3000
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=chat
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
SALT_ROUNDS=10
```

Create `frontend/.env` (see `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3001
```

### 2. Start the database

```bash
docker compose up -d postgres redis
```

### 3. Run the backend

```bash
cd backend
npm install
npm run migration:run
npm run start:dev
```

The API runs on `http://localhost:3000` and the WebSocket server on port `3001`.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

## API Overview

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/auth/register`     | Register a new user                |
| POST   | `/auth/login`        | Log in, returns access + refresh tokens |
| POST   | `/auth/logout`       | Log out (requires auth)            |
| POST   | `/auth/refreshTokens`| Refresh the token pair             |
| GET    | `/conversation`      | List user's conversations          |
| POST   | `/conversation`      | Create a conversation              |

**WebSocket events** (port 3001): `joinConversation`, `sendMessage`, `newMessage`.
