import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  GithubIcon,
  Terminal,
  Zap,
  Database,
  ShieldCheck,
  Radio,
  Cpu,
  RefreshCcw,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { CanvasMockup } from "@/components/CanvasMockup";
import { Button } from "@/components/ui/button";


const ARCH_CARDS = [
  {
    iconName: "Radio",
    title: "Native WebSocket Server",
    tag: "ws · no Socket.io",
    body: "Built directly on the ws library instead of Socket.io, avoiding polling fallbacks and extra abstraction layers. Incoming JSON messages are broadcast directly to room participants with minimal overhead.",
  },
  {
    iconName: "Database",
    title: "O(1) LRU Cache",
    tag: "Map-based · 500-entry cap",
    body: "A custom LRU cache backed by a JavaScript Map eliminates repeated database round-trips. After the first lookup, slug-to-roomId resolution becomes an O(1) cache hit.",
  },
  {
    iconName: "ShieldCheck",
    title: "WebSocket Authentication",
    tag: "Sec-WebSocket-Protocol · DB check",
    body: "The JWT is sent via the Sec-WebSocket-Protocol header instead of a URL query param, preventing tokens from appearing in proxy access logs. The server cross-references the database to confirm membership before joining the collaboration session.",
  },
  {
    iconName: "RefreshCcw",
    title: "FIFO Offline Queue + Backoff",
    tag: "offlineQueue · exp. backoff",
    body: "When the WebSocket is offline, draw events are stored in an in-memory FIFO queue. Reconnection uses exponential backoff (1s to 30s) and flushes the queue in-order before new events are sent.",
  },
  {
    iconName: "Cpu",
    title: "RAF-Throttled Render Loop",
    tag: "requestAnimationFrame · HiDPI",
    body: "In-progress shape previews are drawn inside a requestAnimationFrame callback, coalescing multiple rapid mouse events into a single paint per frame. This prevents main-thread blocking, reducing unnecessary paints and keeping interactions smooth.",
  },
  {
    iconName: "Zap",
    title: "Async Fire-and-Forget DB Writes",
    tag: "non-blocking · Prisma",
    body: "Real-time collaboration should never wait for database writes. Updates are broadcast immediately while persistence happens asynchronously in the background, ensuring a slow database never blocks the drawing experience.",
  },
];

const ICON_MAP: Record<string, ReactNode> = {
  Radio: <Radio size={20} strokeWidth={1.5} />,
  Database: <Database size={20} strokeWidth={1.5} />,
  ShieldCheck: <ShieldCheck size={20} strokeWidth={1.5} />,
  RefreshCcw: <RefreshCcw size={20} strokeWidth={1.5} />,
  Cpu: <Cpu size={20} strokeWidth={1.5} />,
  Zap: <Zap size={20} strokeWidth={1.5} />,
};

const TIMELINE = [
  {
    n: "01",
    title: "Client Captures & Queues Input",
    body: "Pointer movements are filtered to remove redundant points before a completed shape is serialized and sent over WebSockets. If the connection is unavailable, events are queued locally and replayed in order once the client reconnects.",
  },
  {
    n: "02",
    title: "Server Verifies, Caches, then Broadcasts",
    body: "The server validates room membership once, caches slug-to-room mappings in an LRU cache, and broadcasts updates directly to connected participants without repeated database lookups.",
  },
  {
    n: "03",
    title: "DB Write is Fire-and-Forget",
    body: "Updates are broadcast immediately while persistence happens asynchronously in the background. A slow database never delays real-time collaboration, and clients load the latest persisted state when joining a room.",
  },
  {
    n: "04",
    title: "Peers Render via RAF",
    body: "Incoming updates are rendered on the HTML5 Canvas, while in-progress previews are synchronized with requestAnimationFrame to keep drawing smooth under rapid pointer movement.",
  },
];

const ROADMAP = [
  {
    title: "Redis pub/sub for horizontal scaling",
    body: "Room state is currently maintained in-process. Introducing Redis Pub/Sub would allow multiple WebSocket servers to synchronize rooms across instances, enabling horizontal scaling.",
  },
  {
    title: "Worker queue for DB writes",
    body: "Background writes work well under normal load, but high-traffic sessions could overwhelm the database connection pool. A worker queue would decouple persistence from real-time collaboration.",
  },
  {
    title: "Operational Transform or CRDT for conflict resolution",
    body: "Today, concurrent edits follow a last-write-wins model. An Operational Transform or CRDT layer would enable conflict-free collaborative editing at scale.",
  },
];


export default function Index() {
  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 selection:bg-slate-200 antialiased font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1">

        <section className="pt-28 pb-14 md:pt-36 md:pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">

          <div className="mb-7 inline-flex items-center gap-2 border border-slate-200/80 bg-white rounded-full px-3.5 py-1.5 text-[11.5px] font-mono text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <Terminal size={12} className="text-slate-400 shrink-0" />
            TypeScript · Turborepo
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-[72px] font-semibold tracking-tighter leading-[1.1] mb-5">
            <span className="text-neutral-900">Draw together in real time.</span>
            <br className="hidden sm:block" />
            <span className="text-slate-400">Built on native WebSockets.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            A full-stack collaborative canvas with a custom Node.js WebSocket server, JWT authentication, and PostgreSQL persistence, built without third-party real-time SaaS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-[42px]">
            <Button asChild className="w-full sm:w-auto rounded-lg gap-2" size="lg">
              <Link href="/dashboard">
                Start drawing
                <ArrowRight size={15} />
              </Link>
            </Button>

            <Button asChild className="w-full sm:w-auto rounded-lg gap-2" size="lg" variant="outline">
              <a
                href="https://github.com/adityasrc/flowboard"
                target="_blank"
                rel="noreferrer"
              >
                <GithubIcon size={15} />
                View source
              </a>
            </Button>
          </div>

          <p className="text-[11.5px] font-mono text-slate-400 mb-8 tracking-wide">
            TypeScript · React / Next.js · Node.js · ws · PostgreSQL · Prisma · Rough.js
          </p>

          <div className="w-full max-w-5xl mx-auto">
            <CanvasMockup />
          </div>
        </section>

        <section id="features" className="pt-12 pb-16 md:pt-14 md:pb-20 px-6 max-w-6xl mx-auto scroll-mt-14">
          <div className="text-center max-w-2xl mx-auto mb-7 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-950 mb-2.5">
              Engineering Decisions
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Six concrete engineering choices in this codebase, each with a clear technical rationale.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {ARCH_CARDS.map(({ iconName, title, tag, body }) => (
              <article
                key={title}
                className="group bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200 flex flex-col gap-4.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 group-hover:bg-slate-950 group-hover:text-white group-hover:border-slate-950 transition-all duration-200">
                    {ICON_MAP[iconName]}
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-400 bg-slate-50 border border-slate-200/80 rounded px-2 py-0.5 whitespace-nowrap leading-none mt-1">
                    {tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-[15px] font-bold tracking-tight leading-snug text-slate-950 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-[1.65]">{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>


        <section className="pt-12 pb-12 md:pt-14 md:pb-14 px-6 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3">How It Works</h2>
            <p className="text-base text-slate-500">The real-time data flow, end to end.</p>
          </div>

          <div className="relative border-l border-slate-200 ml-4 md:ml-24 space-y-12 pb-4">
            {TIMELINE.map(({ n, title, body }) => (
              <div key={n} className="relative pl-8 md:pl-10">
                <div className="absolute -left-3.5 top-0.5 w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-xs">
                  {n}
                </div>
                <h3 className="text-[15px] font-bold text-slate-950 mb-1.5">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{body}</p>
              </div>
            ))}
          </div>
        </section>


        <section className="pt-10 pb-10 md:pt-12 md:pb-12 px-6 max-w-3xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 shadow-xl">
            <h2 className="text-2xl font-bold tracking-tight mb-1.5">Technical Roadmap</h2>
            <p className="text-sm text-slate-400 mb-8">Planned architectural improvements (not yet shipped).</p>

            <div className="space-y-5">
              {ROADMAP.map(({ title, body }) => (
                <div key={title} className="flex items-start gap-3.5 text-sm text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-2 shrink-0" />
                  <div>
                    <strong className="text-white block mb-0.5">{title}</strong>
                    <span className="text-slate-400 leading-relaxed">{body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-12 pb-20 md:pt-14 md:pb-24 px-6 text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-3">
            Create a room and collaborate in real time.
          </h2>
          <p className="text-[15px] text-slate-500 mb-8">
            Share the URL with anyone with no plugins or installs required. Shapes sync over a raw WebSocket.
          </p>
          <Button asChild className="rounded-lg gap-2" size="lg">
            <Link href="/dashboard">
              Start drawing
              <ArrowRight size={15} />
            </Link>
          </Button>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}
