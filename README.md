🎨 Flowboard
A High-Performance, Real-Time Collaborative Whiteboard

Flowboard is a minimalist, production-ready drawing tool built for seamless real-time collaboration. Inspired by the clean aesthetics of Vercel and Linear, it trades bloated third-party canvas engines for a custom-built, highly optimized HTML5 Canvas architecture powered by native WebSockets.


🚀 The Motivation (Why I Built This)
I built Flowboard to conquer one of the most challenging domains in web development: Real-Time Canvas Manipulation & State Synchronization.

Building a whiteboard isn't just about drawing lines; it's an exercise in complex mathematics, memory management, and network optimization. I wanted to build a tool from scratch to master:

Mathematical Hit-Detection: Using vector projection to calculate distances between user clicks and drawn line segments.

Render Optimization: Decoupling mouse events from browser paints using requestAnimationFrame to achieve a butter-smooth 60fps drawing experience.

State Reconciliation: Handling WebSocket latency by implementing optimistic UI rendering—drawing locally first, then syncing globally.

✨ Key Features
Zero-Lag Collaboration: Native ws WebSocket implementation ensures sub-millisecond stroke broadcasting to all users in a room.

Hand-Drawn Aesthetic: Integrated with rough.js to give shapes and paths a natural, sketchy feel.

Advanced Hit-Detection: Custom Eraser logic that uses bounding boxes for shapes and Euclidean distance/Vector math for straight lines and arrows.

Vercel-Inspired Dashboard: A hyper-minimalist, high-contrast dashboard with JWT-based protected routes and session persistence.

Persistent Rooms: All strokes are serialized and securely stored in a PostgreSQL database via Prisma, meaning you never lose your work on refresh.

🛠️ Tech Stack
Frontend:

Next.js 14 (App Router)

React (Hooks, Context, Ref architecture)

Tailwind CSS & Shadcn UI (Minimalist design system)

HTML5 Canvas API & Rough.js

Backend:

Node.js & Express

Native WebSockets (ws)

PostgreSQL (Database)

Prisma (ORM)

JWT (Authentication)

🧠 Engineering Highlights (The Technical Flex)
Solving the "Canvas Jitter": Dragging shapes across a canvas often causes visual vibration due to negative width/height coordinates. Flowboard implements a strictly normalized bounding-box algorithm (Math.min / Math.abs) to ensure mathematically perfect renders regardless of drag direction.

Optimized Render Loop: Preventing UI thread blocking by throttling high-frequency mousemove events through cancelAnimationFrame and requestAnimationFrame.

Precision Eraser Engine: Instead of simply clearing pixels, the eraser mathematically checks if the pointer's coordinates intersect with the mathematical definition of a shape (e.g., using the Pythagorean theorem for circles, and Dot Products for line projections).

Double-Render Prevention: Implemented strict WebSocket event deduplication. When a user draws, the shape is pushed to the local array and the server simultaneously. The incoming broadcast is filtered via unique UUIDs to prevent "ghost" shapes.

💻 Running Locally
1. Clone the repository

Bash
git clone https://github.com/yourusername/flowboard.git
cd flowboard
2. Setup the Backend

Bash
cd backend
npm install
# Set your DATABASE_URL and JWT_SECRET in .env
npx prisma generate
npx prisma db push
npm run dev
3. Setup the Frontend

Bash
cd frontend
npm install
# Set NEXT_PUBLIC_HTTP_BACKEND and NEXT_PUBLIC_WS_BACKEND in .env.local
npm run dev
4. Start Drawing
Open http://localhost:3000, create an account, generate a room, and share the slug with a friend!

🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📄 License
This project is MIT licensed.