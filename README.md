# Flowboard

A collaborative whiteboard with a custom HTML5 Canvas drawing engine, a native Node.js WebSocket server, JWT authentication, and PostgreSQL persistence. Multiple users can draw on a shared canvas in real time. Shapes sync to all connected clients immediately and persist across sessions.

Built without third-party real-time services. The WebSocket server is a plain Node.js process using the `ws` library.

**Live demo:** [flowboardhq.vercel.app](https://flowboardhq.vercel.app)

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

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | Next.js 16 (App Router), React 19, TypeScript |
| Rendering | HTML5 Canvas + Rough.js                       |
| Styling   | Tailwind CSS v4, Radix UI (via shadcn/ui)     |
| HTTP API  | Node.js, Express, Zod, express-rate-limit     |
| WebSocket | Node.js, `ws` library                         |
| Database  | PostgreSQL, Prisma ORM                        |
| Auth      | JWT (bcrypt password hashing)                 |
| Monorepo  | Turborepo, pnpm workspaces                    |

---

## Architecture

Three separate processes. The WebSocket server handles all real-time traffic; the HTTP server handles auth, room management, and shape loading.

```
Browser
  |
  |-- REST -------> http-backend   :3001  (Express)
  |                     |
  |                     `--> PostgreSQL  (Prisma)
  |
  |-- WebSocket --> ws-backend     :8081  (ws)
                        |
                        |--> Broadcast to room peers  (immediate)
                        `--> PostgreSQL write         (async, after broadcast)
```

**Draw event flow:**

1. Shape is created on mouseup, serialized, and passed to `socket.send()`.
2. The WebSocket server resolves the room ID (LRU cache, then DB) and broadcasts to connected peers.
3. The database write fires asynchronously after broadcast - a slow write does not delay peers.
4. Peers render the incoming shape immediately on receipt.

**Offline behavior:**
`shape` and `delete_shape` events are queued in memory when the socket is closed. Cursor events are dropped. On reconnect, the queue is flushed before any new events are sent, and the client fetches the latest persisted shapes to fill any gaps missed while offline.

---

## Project Structure

```
flowboard/
|-- apps/
|   |-- web/               # Next.js frontend
|   |   |-- app/           # Pages: /, /dashboard, /canvas/[roomId], /signin, /signup
|   |   |-- components/    # React components
|   |   `-- draw/          # Canvas engine: WhiteboardEngine, renderer, shapeFactory, hitTest, types
|   |-- http-backend/      # Express REST API (auth, rooms, shapes)
|   `-- ws-backend/        # WebSocket server (real-time sync, heartbeat, LRU cache)
`-- packages/
  |-- common/            # Zod schemas, generateSlug (shared across all apps)
  |-- database/          # Prisma schema and generated client
  |-- typescript-config/ # Shared tsconfig base
  `-- eslint-config/     # Shared ESLint config
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for local PostgreSQL)

### Installation

```bash
git clone https://github.com/adityasrc/flowboard.git
cd flowboard
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env` at the repo root and fill in the values:

```env
POSTGRES_DB=flowboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_PORT=5432

DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/flowboard"

JWT_SECRET=your-secret-here
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_HTTP_BACKEND=http://localhost:3001
NEXT_PUBLIC_WS_BACKEND=ws://localhost:8081
```

### Development

```bash
# Start PostgreSQL
docker-compose up -d

# Run database migrations
cd packages/database
pnpm prisma migrate dev
cd ../..

# Start all services (Next.js :3000, HTTP :3001, WebSocket :8081)
pnpm dev
```

### Production Build

```bash
pnpm build
```

Turborepo builds packages in dependency order and caches outputs by content hash.

---

## Engineering Decisions

**JWT via `Sec-WebSocket-Protocol`**
The browser WebSocket API does not support custom headers on the initial handshake. Passing the token in the URL exposes it in server access logs. The `Sec-WebSocket-Protocol` header is the standard workaround - it's available at handshake time and keeps the token out of logs. The server echoes it back to complete the upgrade.

**7-day JWT expiration without refresh tokens**
Access tokens are signed with a 7-day expiration and stored client-side. For this project scope, a long-lived single token avoids the complexity of refresh-token rotation and background re-auth plumbing while keeping active collaboration sessions uninterrupted.

**Fire-and-forget database writes**
Shapes are broadcast to peers before the database write completes. The tradeoff is that a crash in the narrow window between broadcast and write could lose a shape. In practice that window is a few milliseconds. Waiting for a DB acknowledgement before broadcasting would add query latency to every draw event for every connected user.

**LRU cache for room resolution**
The WebSocket server needs a room's numeric database ID on every shape event. A 500-entry Map-based LRU eliminates repeated DB round-trips after the first lookup per room. The cache is in-process and resets on restart, so the first event after a restart pays the DB cost once.

**Offline queue scoped to shape events only**
Cursor positions are ephemeral - they have no meaning after the connection drops. Only `shape` and `delete_shape` messages are queued. This keeps the queue small and replay order deterministic.

---

## Known Limitations

**No shape selection or movement.** Placed shapes cannot be selected, dragged, or resized after drawing; the canvas model is strictly additive (drawing) and subtractive (eraser/undo).

**Silent disconnect window.** When a physical network drops, the browser may report `readyState === OPEN` for several seconds while the TCP stack times out. Shapes sent during this window are buffered by the OS and silently discarded when the connection closes. Shapes drawn _after_ `onclose` fires are queued and replayed correctly.

**Single server instance.** Room state is held in process memory. Running multiple WebSocket server instances would require a pub/sub layer (e.g. Redis) to relay events across them.

**250 shape limit per room.** The shapes endpoint returns the 250 most recent shapes. Older shapes are not loaded on join.

---

## Future Improvements

- Redis pub/sub for horizontal WebSocket scaling
- Canvas panning and zoom
- Shape selection and repositioning after placement
- Granular room permissions (e.g. view-only links vs. editor access; currently any authenticated user with a room link can join as a collaborator)
