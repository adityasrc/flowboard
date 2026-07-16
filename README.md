# Flowboard

A minimal, lightning-fast collaborative whiteboard built from scratch to explore how real-time applications actually work under the hood.

Instead of plugging in heavy, pre-built whiteboard libraries (like Excalidraw or Fabric.js), I wanted to understand the raw mechanics: **How do you synchronize thousands of hand-drawn coordinates across multiple browsers without lag, stuttering, or breaking the canvas?**

Flowboard answers that by pairing a custom HTML5 Canvas drawing engine with native WebSockets, using clean geometry math to handle everything from boundary collisions to shape intersections natively.

---

## Why Built From Scratch?

When you use a pre-built canvas library, you miss out on solving the most interesting frontend and networking problems. By stripping away the abstractions, I had to figure out how to handle real-world browser quirks, network delays, and concurrent users on a shared screen.

Here is how Flowboard handles those challenges:

### 1. Drawing Backwards Without Breaking the Canvas (The Jitter Bug)

* **The Problem:** When you click and drag to draw a rectangle from right-to-left or bottom-to-top, the width and height math becomes negative. Standard canvas renderers freak out and cause the shape to vibrate wildly on screen.
* **The Fix:** I wrote a coordinate normalizer using simple max/min math that automatically flips negative dimensions into clean, positive values. You can drag your mouse as fast and chaotically as you want, and the shape stays solid.

### 2. Smooth 60 FPS Drawing Without Freezing the Browser

* **The Problem:** If you redraw an entire screen full of shapes on every single millisecond your mouse moves (`mousemove`), the browser's main thread chokes, causing severe screen stutter.
* **The Fix:** I hooked the drawing loop directly into the browser's refresh rate using `requestAnimationFrame`. If the mouse fires faster than the screen can refresh, stale frames are instantly canceled. The canvas stays locked at a buttery-smooth 60 frames per second.

### 3. Instant Drawing Without "Ghost" Echoes

* **The Problem:** To make drawing feel instant, your lines appear on your screen immediately while being sent to the server in the background. However, when the server broadcasts that new shape to everyone in the room, it also sends it back to *you*, causing a duplicate "ghost shape" to render over your original line.
* **The Fix:** Every shape gets a unique ID (UUID). The frontend tracks what you just drew and automatically ignores any incoming WebSocket echoes that match your own IDs.

### 4. Never Waiting on a Slow Database

* **The Problem:** If the WebSocket server waits for a database to confirm it saved a shape before showing it to other users, a momentary database lag freezes the drawing experience for the entire room.
* **The Fix:** The server decouples real-time broadcasting from storage. The moment a shape arrives, it is blasted out to all connected users instantly, while PostgreSQL saves the data asynchronously in the background.

### 5. Surviving Network Blips and Server Restarts

* **The Problem:** Cloud servers often go to sleep or drop connections. A standard WebSocket just dies, leaving users stuck on a broken screen.
* **The Fix:** The frontend uses an intelligent auto-reconnect loop that tries to reconnect in stepping intervals (1s, 2s, 4s, up to 30s). On the server side, a background heartbeat checks on users every 30 seconds, cleanly disconnecting ghost connections before they eat up memory.

### 6. Safe Undo (Only Erasing *Your* Mistakes)

* **The Problem:** In a shared canvas, the application stores everyone's drawings in one master list. If you press `Ctrl+Z` and the app simply removes the last shape added to the list, you might accidentally erase a teammate's drawing!
* **The Fix:** The engine tracks shape ownership locally using a Set of your personal shape IDs. When you hit Undo, the engine walks backward through the shared list, finds the most recent line *you* drew, and safely removes only that one.

### 7. Smart Pencil Throttling (70% Smaller Data Payloads)

* **The Problem:** Freehand drawing captures hundreds of mouse coordinates per second, many of which sit practically on top of each other. Sending all of them floods the network.
* **The Fix:** A distance-based throttle checks every new mouse position. If it is less than 5 pixels away from the last recorded point, it gets ignored. This shrinks the WebSocket payload size by ~70% without changing how smooth the sketch looks to the human eye.

---

## How It Works Under the Hood

```text
[ Next.js Frontend ] <--- WebSockets (Instant Broadcasts) ---> [ Node.js Server ]
 (HTML5 Canvas + Rough.js)                                      (In-Memory Cache)
                                                                       |
                                                              Asynchronous Write
                                                                       v
                                                             [ PostgreSQL Database ]

```

* **The Frontend:** Built with **Next.js** and styled with **Tailwind CSS**. It uses raw **HTML5 Canvas 2D** combined with **Rough.js** to give shapes an organic, hand-sketched feel. Coordinates are scaled against the device's pixel ratio so drawings stay crisp on high-resolution displays.
* **The Real-Time Layer:** A standalone **Node.js WebSocket server**. To keep workspaces secure without leaking credentials in server proxy logs, authentication tokens are passed safely inside the `Sec-WebSocket-Protocol` header instead of the URL. The server also keeps an in-memory cache of active rooms so it doesn't have to hammer the database every time someone draws.
* **The Database:** Managed with **PostgreSQL** and **Prisma**. At startup, the server validates all environment variables and secrets immediately—crashing safely with a clear warning if anything is missing, rather than failing silently later.

---

## Tech Stack

* **Frontend:** Next.js (App Router), React, Tailwind CSS, TypeScript
* **Graphics Engine:** Custom HTML5 Canvas 2D API + Rough.js
* **Networking:** Native WebSockets (WS/WSS)
* **Backend:** Node.js, Express
* **Database & ORM:** PostgreSQL, Prisma
* **Monorepo Tooling:** Turborepo, pnpm

---

## Running the Project Locally

To test the multi-user synchronization on your own machine, you will need Node.js and `pnpm` installed.

**1. Clone the repository and install dependencies:**

```bash
git clone https://github.com/adityasrc/flowboard.git
cd flowboard
pnpm install

```

**2. Set up your environment variables:**
Create a `.env` file in the root directory and add your PostgreSQL database URL and a secret key for JWT sessions:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/flowboard"
JWT_SECRET="your-super-secret-key"

```

**3. Push the database schema:**

```bash
cd packages/database
npx prisma generate
npx prisma db push
cd ../..

```

**4. Start the development servers:**

```bash
pnpm dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser. To see the collaboration in action, open a second tab (or an Incognito window), join the same room, and start sketching!