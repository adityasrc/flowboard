🎨 Flowboard
Flowboard is a minimal, fast, real-time collaborative whiteboard. No bloated third-party canvas libraries—just pure HTML5 Canvas, WebSockets, and a lot of math. Inspired by the clean aesthetics of Vercel and Linear, it's built to be fast, responsive, and persistent.

🚀 Why I Built This
Honestly, I didn't just want to build another drawing app. I built Flowboard because I wanted to understand the hard parts of web development: high-frequency state synchronization and raw canvas manipulation.

Instead of plugging in a heavy pre-built engine, I built this from scratch to figure out:

Vector Math: How to calculate exact distances between a mouse click and a drawn line.

Render Cycles: How to drop React's default re-renders and use requestAnimationFrame for a butter-smooth 60fps experience.

Optimistic UI: How to hide network latency by drawing locally first, then syncing globally without causing duplicate "ghost" renders.

✨ What's Inside?
Zero-Lag Sync: Native ws WebSockets to broadcast strokes in sub-milliseconds.

Hand-Drawn Vibe: Integrated rough.js so shapes don't look boring and rigid.

Math-Based Eraser: It doesn't just wipe pixels. The eraser calculates if your cursor intersects with a shape's mathematical bounds (using Pythagorean theorem for circles, and Dot Products for lines).

Persistent Sessions: Every stroke is serialized and saved in a PostgreSQL DB via Prisma. Refresh the page, and your board is exactly how you left it.

JWT Protected: Secure, isolated rooms for your team.

🛠️ The Stack
Frontend: Next.js 14, React, Tailwind CSS, Shadcn UI, HTML5 Canvas API

Backend: Node.js, Express, Native WebSockets (ws)

Database: PostgreSQL, Prisma ORM

🧠 The Technical Flex (Problems I Solved)
Killing the "Canvas Jitter": If you drag a shape backwards (right-to-left), the width/height becomes negative and the canvas engine freaks out, causing the shape to vibrate. I fixed this by writing a custom normalizer using Math.min and Math.abs to ensure coordinates are always strictly positive, no matter how chaotic the mouse drag is.

Unblocking the Main Thread: Throttling high-frequency mousemove events using cancelAnimationFrame and requestAnimationFrame to keep the UI from freezing during intense drawing sessions.

Echo Cancellation: When you draw, the shape renders instantly on your screen and fires to the server. But when the server broadcasts that same shape back to the room, your client needs to know to ignore it. I implemented UUID-based deduplication to stop double-renders.

💻 Run it Locally
1. Clone the repo

Bash
git clone https://github.com/adityasrc/flowboard.git
cd flowboard
2. Fire up the Backend

Bash
cd backend
npm install
# Add your DATABASE_URL and JWT_SECRET to .env
npx prisma generate
npx prisma db push
npm run dev
3. Fire up the Frontend

Bash
cd frontend
npm install
# Add NEXT_PUBLIC_HTTP_BACKEND and NEXT_PUBLIC_WS_BACKEND to .env.local
npm run dev
4. Start Drawing
Go to http://localhost:3000, log in, create a room, and share the URL.

🤝 Contributing
Found a bug or want to optimize the math even further? PRs are always welcome.

📄 License
MIT License.