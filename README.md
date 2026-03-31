# Flowboard

I built Flowboard because I wanted to understand the actual mechanics of real-time collaboration. It's easy to simply plug in a heavy, pre-built whiteboard engine, but I wanted to figure out how high-frequency state synchronization and raw canvas manipulation actually work under the hood.

This project is a minimal, fast, and highly persistent collaborative whiteboard. It relies on pure HTML5 Canvas and native WebSockets, utilizing a lot of underlying vector math to calculate intersections, dot products, and boundary collisions natively.

## Core Engineering Problems Solved

When building this architecture from scratch, I had to solve a few interesting engineering challenges:

The first was the **canvas jitter** problem. If you click and drag a shape backwards across the screen (right-to-left or bottom-to-top), the width and height calculations physically become negative. This causes standard canvas renderers to freak out and vibrate the drawn shape uncontrollably. I wrote a custom mathematical normalizer using bounded max/min logic to ensure the rendering coordinates are always strictly positive, regardless of how fast or chaotic the mouse trajectory is.

The second challenge was **rendering performance**. Redrawing an entire array of shapes sequentially on every single `mousemove` event immediately blocks the main thread and tanks the browser's frame rate. I implemented a render-throttling mechanism relying closely on `requestAnimationFrame` to rapidly cancel stale ghost frames and maintain a smooth 60 frames per second during aggressive drawing sweeps.

The third was **optimistic UI and echo cancellation**. When you draw a shape, it renders instantly on your local screen to hide network latency, while simultaneously firing over the WebSocket. However, when the server blindly broadcasts that same shape back to everyone in the room, it would double-render a "ghost shape" on the original client. I built a UUID-based deduplication layer on the frontend to explicitly ignore returning echoes of a client's own shapes.

The fourth was **decoupling the real-time path from persistence**. On every shape creation, the WebSocket server immediately broadcasts to all room members and then fires a non-blocking PostgreSQL write in the background. The event loop is never stalled waiting for a Neon round-trip, which means a slow database never freezes the canvas for everyone in the room.

The fifth was **connection resilience**. The frontend implements an exponential backoff reconnect loop (`1s → 2s → 4s → 8s → 16s`) so a brief network blip or a server cold-start never leaves users stranded on a silent loading screen. On the server side, a 30-second ping/pong heartbeat detects and terminates ghost connections before they accumulate in memory.

The sixth was **user-scoped undo**. In a collaborative canvas, `this.shapes` contains every user's shapes. A naive `.pop()` on undo would destroy the last shape in the array — which could be another user's work. The undo stack now tracks shape ownership locally via a `Set<string>` and walks backward through the array to find only the calling user's most recent shape.

Finally, **pencil point optimization**. Raw mouse coordinates captured at 60fps produce hundreds of redundant collinear points per stroke. A distance-based throttle (5px minimum separation) discards visually identical samples before they reach the coordinate array, cutting typical pencil payloads by ~70% with no perceptible quality loss.

## System Architecture

The frontend is a Next.js application tightly integrated with a raw HTML5 Canvas API, utilizing Rough.js under the hood for an organic, hand-drawn architectural aesthetic.

The real-time layer is handled by an isolated Node.js WebSocket server. The JWT is transported via the `Sec-WebSocket-Protocol` header rather than the URL query string — query params are recorded verbatim by every reverse proxy's access log, making URL-based tokens a credential leak surface. To prevent the database connection pool from rapidly exhausting during high-frequency shape broadcasting, I implemented an in-memory local dictionary cache `roomCache` on the WebSocket server that eliminates heavy N+1 PostgreSQL queries.

Persistence is managed seamlessly through PostgreSQL and orchestrated by Prisma. Workspaces are protected by a lightweight JWT authentication layer so sessions remain secure. The `JWT_SECRET` is validated at server startup — a missing secret causes an immediate crash with a clear error rather than silently falling back to a known string.

## Running the Environment Locally

If you want to spin this up locally to inspect the architecture, the monorepo uses `pnpm`.

1. Clone the repository and install the workspace dependencies:
```bash
git clone https://github.com/adityasrc/flowboard.git
cd flowboard
pnpm install
```

2. Setup the database schema:
Create a `.env` file in the root with your `DATABASE_URL` and `JWT_SECRET`.
```bash
cd packages/database
npx prisma generate
npx prisma db push
cd ../..
```

3. Boot the monorepo:
```bash
pnpm dev
```

The application will start on `localhost:3000`. Create an account, spin up a workspace, and start analyzing the socket traffic in your network tab.