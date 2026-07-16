# Flowboard — Frontend (`apps/web`)

Flowboard is a low-latency, real-time collaborative whiteboard built for developers, designers, and teams who want to sketch out ideas without getting bogged down by slow interfaces or clunky UI. 

Instead of relying on heavy out-of-the-box canvas libraries, we built a custom object-oriented drawing engine from scratch using **HTML5 Canvas**, **Rough.js**, and native **WebSockets**. The result is a workspace that feels instant, responsive, and tactile.

---

## What Makes This Frontend Special?

We didn't just build a drawing app; we focused on real-world browser quirks, network performance, and user experience. Here are a few things happening under the hood:

* **Instant Room Joins (Optimistic Routing):** When you type a room slug to join, we don't make you wait for a slow database check before changing pages. We route you to the canvas instantly and let the WebSocket connection authenticate you in the background. It cuts perceived latency in half.
* **Hand-Drawn Vibe, Crisp Precision:** Using Rough.js, every shape gets a slight, organic hand-drawn sketch look. More importantly, we scale coordinates using `window.devicePixelRatio` so your drawings never look blurry or pixelated on Retina displays, MacBooks, or 4K monitors.
* **Smart Network Throttling:** When you draw freehand with the Pencil tool, your mouse fires hundreds of coordinates a second. Our engine calculates the Pythagorean distance between points and silently trims out redundant, overlapping samples. This keeps your drawing smooth while shrinking WebSocket payloads by up to 60%.
* **User-Scoped Undo / Redo:** There is nothing worse than pressing `Ctrl+Z` on a whiteboard and accidentally erasing your teammate's work. Our engine tracks shape ownership locally, so your undo and redo stacks only ever affect the lines *you* drew.
* **Zero Orphaned DOM Leaks:** When you use the Text tool, temporary input boxes are tracked by the class engine. If you navigate away or close the tab while typing, the engine cleans up after itself so no invisible DOM elements get left behind.

---

## Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling & Design Tokens:** [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components:** [Radix UI / Shadcn primitives](https://ui.shadcn.com/) + Lucide Icons
* **Graphics Engine:** Custom HTML5 Canvas 2D + [Rough.js](https://roughjs.com/)
* **Real-time Networking:** Native WebSockets (with custom JWT `Sec-WebSocket-Protocol` headers for security)
* **HTTP Client:** Axios (with strict TypeScript Zod/error handling)

---

## Getting Started

### 1. Prerequisites
Make sure you have Node.js (v18+) installed. We recommend using `pnpm`, but `npm`, `yarn`, or `bun` work fine too.

### 2. Environment Variables
Create a `.env.local` file in the root of this frontend directory (`apps/web`) and add your backend endpoints:

```env
NEXT_PUBLIC_HTTP_BACKEND="http://localhost:3001"
NEXT_PUBLIC_WS_BACKEND="ws://localhost:8080"

```

### 3. Install Dependencies

```bash
npm install
# or
pnpm install

```

### 4. Run the Development Server

```bash
npm run dev
# or
pnpm dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) in your browser to start sketching.

---

## Project Overview

Here is a quick tour of where the magic happens:

```text
apps/web/
├── app/
│   ├── layout.tsx         # Root layout with Geist font optimization & SEO metadata
│   ├── page.tsx           # The landing page (Features, Architecture roadmap)
│   ├── signin/ & signup/  # Auth pages with native <form> and password-manager autofill
│   ├── dashboard/         # Workspace management & optimistic room routing
│   └── canvas/[slug]/     # Dynamic workspace route (locks scrollbars & renders whiteboard)
├── components/
│   ├── Canvas.tsx         # Topbar UI, keyboard shortcuts, and High-DPI canvas wrapper
│   ├── IconButton.tsx     # Type-safe, accessible button primitive with automatic tooltips
│   └── RoomCanvas.tsx     # WebSocket lifecycle manager with exponential backoff reconnects
└── src/draw/
    ├── WhiteboardEngine.ts # The core OOP drawing class (Shapes, Math, Undo/Redo, 60 FPS loop)
    └── http.ts            # Safe initial database fetching for existing room shapes

```

---

## Keyboard Shortcuts

* **`Ctrl + Z`** — Undo your last shape
* **`Ctrl + Y`** — Redo your last undone shape
* **`Enter`** — Submit forms or lock text input onto the canvas

---

## Built By

Designed and engineered as a deep dive into low-latency state synchronization, HTML5 Canvas math, and modern React 19 / Next.js architecture.

```

***
