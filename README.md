# Flowboard

A collaborative whiteboard with a custom HTML5 Canvas drawing engine, a native Node.js WebSocket server, JWT authentication, and PostgreSQL persistence. Multiple users can draw on a shared canvas in real time. Shapes sync to all connected clients immediately and persist across sessions.

Built without third-party real-time services. The WebSocket server is a plain Node.js process using the `ws` library.

---

## Features

- Rectangle, circle, diamond, line, arrow, freehand pencil, and text tools
- Eraser with point-in-shape hit testing
- Undo and redo, scoped to your own shapes
- Live remote cursors with per-user color assignment
- Shapes drawn while offline are queued locally and replayed in order on reconnect
- Named rooms with shareable invite links
- Download canvas as PNG
- Dashboard with canvas thumbnails

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Rendering | HTML5 Canvas + Rough.js |
| Styling | Tailwind CSS v4, Radix UI, shadcn/ui |
| HTTP API | Node.js, Express, Zod, express-rate-limit |
| WebSocket | Node.js, `ws` library |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (bcrypt password hashing) |
| Monorepo | Turborepo, pnpm workspaces |

---

## Architecture

Three separate processes. The WebSocket server handles all real-time traffic; the HTTP server handles auth, room management, and shape loading.

```
Browser
  |
  |-- REST -------> http-backend   :3001  (Express)
  |                     |
  |                     └--> PostgreSQL  (Prisma)
  |
  |-- WebSocket --> ws-backend     :8081  (ws)
                        |
                        ├--> Broadcast to room peers  (immediate)
                        └--> PostgreSQL write         (async, after broadcast)
```

**Draw event flow:**
1. Shape is created on mouseup, serialized, and passed to `socket.send()`.
2. The WebSocket server resolves the room ID (LRU cache, then DB), and broadcasts to connected peers.
3. The database write fires asynchronously after broadcast. A slow write does not delay peers.
4. Peers render the incoming shape via `requestAnimationFrame`.

**Offline behavior:**
`shape` and `delete_shape` events are pushed to an in-memory FIFO queue when the socket is closed. Cursor events are dropped. On reconnect, the queue is flushed before new events are sent, and the client fetches the latest persisted shapes to fill any gaps.

---

## Project Structure

```
flowboard/
├── apps/
│   ├── web/               # Next.js frontend
│   │   ├── app/           # Pages: /, /dashboard, /canvas/[roomId], /signin, /signup
│   │   ├── components/    # React components
│   │   └── draw/          # Canvas engine: WhiteboardEngine, renderer, shapeFactory, hitTest, types
│   ├── http-backend/      # Express REST API (auth, rooms, shapes)
│   └── ws-backend/        # WebSocket server (real-time sync, heartbeat, LRU cache)
└── packages/
    ├── common/            # Zod schemas, generateSlug (shared across all apps)
    ├── database/          # Prisma schema and generated client
    ├── backend-common/    # JWT_SECRET loader with fail-fast validation
    ├── typescript-config/ # Shared tsconfig base
    └── eslint-config/     # Shared ESLint config
```

---

## Getting Started

### Prerequisites

- Node.js 20.x
- pnpm 9.x
- Docker (for local PostgreSQL)

### Installation

```bash
git clone https://github.com/adityasrc/flowboard.git
cd flowboard
pnpm install
```

### Environment Variables

Root `.env` (used by both backend processes):

```env
# Docker Compose
POSTGRES_DB=flowboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword

# Prisma
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowboard"

# Both backends
JWT_SECRET=your-secret-here
```

`apps/web/.env.local`:

```env
NEXT_PUBLIC_HTTP_BACKEND=http://localhost:3001
NEXT_PUBLIC_WS_BACKEND=ws://localhost:8081
```

### Development

```bash
# Start PostgreSQL
docker-compose up -d

# Run migrations
cd packages/database && pnpm prisma migrate dev && cd ../..

# Start all services
pnpm dev
```

This runs the Next.js app on `:3000`, the HTTP server on `:3001`, and the WebSocket server on `:8081` concurrently via Turborepo.

### Production Build

```bash
pnpm build
```

Turborepo builds packages in dependency order and caches outputs by content hash.

---

## Engineering Decisions

**JWT via `Sec-WebSocket-Protocol`**
The browser WebSocket API does not allow custom headers on the handshake. Passing the token in the URL exposes it in server access logs. The `Sec-WebSocket-Protocol` header is the standard workaround and keeps the token out of logs. The server echoes the header back to complete the handshake.

**Fire-and-forget database writes**
Shapes are broadcast to peers before the database write completes. The tradeoff is that a crash between broadcast and write could lose a shape. In practice the window is a few milliseconds. Waiting for a database ACK before broadcasting would add query latency to every draw event for every user in the room.

**LRU cache for room resolution**
The WebSocket server needs a room's numeric database ID on every shape event. A 500-entry Map-based LRU eliminates repeated DB round-trips after the first event per room. The cache is in-process and resets on restart.

**Offline queue scoped to shape operations only**
Cursor positions are ephemeral and have no value after the connection drops. Only `shape` and `delete_shape` messages are queued. This keeps the queue small and replay deterministic.

---

## Known Limitations

**Silent disconnect window.** When a physical network drops, browsers may report `readyState === OPEN` for several seconds while the TCP stack times out. Shapes sent during this window are buffered by the OS and discarded when the connection closes. They are not queued or recoverable. Shapes drawn after `onclose` fires are queued and replayed correctly.

**Single WebSocket server instance.** Room state is held in process memory. Running multiple instances would require a pub/sub layer (e.g. Redis) to relay events across them.

**250 shape limit per room.** The shapes endpoint returns the 250 most recent shapes per room. Older shapes are not loaded on join.

---

## Future Improvements

- Redis pub/sub for horizontal WebSocket scaling
- Canvas panning and zoom (coordinate system is currently fixed to the viewport)
- Shape selection and repositioning after placement
- Room access control (any authenticated user can currently join any room by slug)

---

## Documentation

For a deep dive into the architecture, WebSocket protocol, drawing engine internals, and engineering tradeoffs, visit `/docs` in the web application.