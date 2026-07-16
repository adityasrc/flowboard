"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Github, Zap, Cpu, ShieldCheck } from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { HTTP_BACKEND } from "@/config";

export default function Index() {
  const [imgError, setImgError] = useState(false);

  // Pre-warm the backend on page load — the render server spins down after ~15 min of inactivity
  useEffect(() => {
    fetch(`${HTTP_BACKEND}/`).catch(() => { });
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 selection:bg-slate-200 antialiased font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08] mb-6">
            Real-time whiteboarding,<br className="hidden sm:block" />
            built on native WebSockets.
          </h1>

          {/* max-w-4xl aur zero <br/> tags ensures text spreads horizontally across the screen */}
          <p className="text-[16px] md:text-[18px] text-slate-600 max-w-4xl mx-auto mb-10 leading-relaxed font-normal px-2">
            Engineered to avoid Socket.io overhead using native WebSockets. Includes a custom Node.js backend with JWT-based authentication.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-16">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-950 text-white hover:bg-slate-800 text-[14px] font-medium h-11 px-7 rounded-xl shadow-sm transition-all duration-200"
            >
              Start drawing
              <ArrowRight size={16} />
            </Link>

            <a
              href="https://github.com/adityasrc/flowboard"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-[14px] font-medium text-slate-700 bg-white border border-slate-200 hover:text-slate-950 hover:bg-slate-50 hover:border-slate-300 h-11 px-6 rounded-xl shadow-xs transition-all duration-200"
            >
              <Github size={16} />
              View source
            </a>
          </div>

          <div className="w-full max-w-5xl mx-auto">
            <div className="relative rounded-2xl bg-white/80 border border-slate-200/80 p-2 shadow-xl shadow-slate-950/5">
              <div className="rounded-xl overflow-hidden border border-slate-200/60 bg-slate-900">
                <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-md text-[11px] font-mono text-slate-300">
                    flowboard.app/canvas/live-sync
                  </div>
                  <div className="w-12" />
                </div>

                {imgError ? (
                  <div className="aspect-video md:aspect-21/9 bg-slate-950 flex flex-col items-center justify-center gap-2 p-6">
                    <p className="text-[13px] text-slate-400 font-medium">Actual App UI Screen</p>
                  </div>
                ) : (
                  <img
                    src="/actualUI.png"
                    alt="Flowboard Real-time Canvas"
                    className="w-full h-auto block bg-slate-950"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-6 text-center gap-2">
            <p className="text-[14px] font-medium text-slate-500">
              Actual app UI, not a static mockup.
            </p>
            <p className="text-[13px] font-mono text-slate-400">
              Tech Stack: Next.js · Node.js · ws · PostgreSQL · Prisma · Tailwind · Rough.js
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 px-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 md:p-12 shadow-xs text-center max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold text-slate-950 mb-3 tracking-tight">
              Why Flowboard?
            </h2>
            <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Most online canvases optimize for an endless list of features.
              <strong> Flowboard focuses strictly on low-latency communication, simple architecture, and state synchronization.</strong> It serves as a technical demonstration of handling WebSocket data pipelines without relying on third-party real-time SaaS providers.
            </p>
          </div>
        </section>

        <section id="features" className="py-12 px-6 max-w-5xl mx-auto scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3">Architecture Decisions</h2>
            <p className="text-[16px] text-slate-600">The engineering principles behind the canvas and networking layers.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5">
                  <Zap size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-slate-950 mb-2.5">Native WebSockets</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Bypassed Socket.io completely. Using the native ws library allows the server to process stringified JSON payloads directly, reducing CPU overhead during collaborative drawing sessions.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5">
                  <Cpu size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-slate-950 mb-2.5">Raw Canvas & Rough.js</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Avoids monolithic canvas frameworks. The interaction layer and state management are built directly on the HTML5 Canvas API, utilizing Rough.js for a hand-drawn aesthetic.
                </p>
              </div>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all duration-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-5">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-slate-950 mb-2.5">Custom Auth & Persistence</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">
                  Uses stateless JWT verification for connection handshakes. Board states are persisted asynchronously in PostgreSQL via Prisma, allowing users to rejoin and fetch existing room states cleanly.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 mb-3">How It Works</h2>
            <p className="text-[16px] text-slate-600">The real-time data synchronization flow.</p>
          </div>

          <div className="relative border-l border-slate-200 ml-4 md:ml-32 space-y-12 pb-4">
            <div className="relative pl-8 md:pl-10">
              <div className="absolute -left-3.5 top-0.5 w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-xs">
                01
              </div>
              <h3 className="text-[16px] font-bold text-slate-950 mb-1.5">Client Captures Input</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl">
                Mouse movement and geometry coordinates are captured locally and streamed across the open WebSocket connection without blocking the main browser thread.
              </p>
            </div>

            <div className="relative pl-8 md:pl-10">
              <div className="absolute -left-3.5 top-0.5 w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-xs">
                02
              </div>
              <h3 className="text-[16px] font-bold text-slate-950 mb-1.5">Server Persists & Broadcasts</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl">
                The Node.js backend broadcasts shape payloads to all peers subscribed to the room, while asynchronously writing the state to PostgreSQL in the background.
              </p>
            </div>

            <div className="relative pl-8 md:pl-10">
              <div className="absolute -left-3.5 top-0.5 w-7 h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-[11px] font-bold text-slate-900 shadow-xs">
                03
              </div>
              <h3 className="text-[16px] font-bold text-slate-950 mb-1.5">Clients Reconcile State</h3>
              <p className="text-[14px] text-slate-600 leading-relaxed max-w-xl">
                Receiving clients render incoming coordinate data onto their local canvas layer immediately upon receipt, maintaining a responsive drawing experience.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 max-w-3xl mx-auto">
          <div className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 shadow-xl">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Technical Roadmap</h2>
            <p className="text-[14px] text-slate-400 mb-8">Architectural improvements planned for future iterations.</p>

            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-3.5 text-[14px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <div>
                  <strong className="text-white">Redis-backed room scaling:</strong> Moving in-memory room state (<code className="text-slate-300 bg-slate-800 px-1 py-0.5 rounded text-[12px] font-mono">users[]</code>) to an external Redis pub/sub broker to support horizontal multi-server scaling.
                </div>
              </div>
              <div className="flex items-start gap-3.5 text-[14px] text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <div>
                  <strong className="text-white">Message Queue Integration:</strong> Offloading database writes to an asynchronous worker queue to prevent connection pool exhaustion during heavy collaborative drawing sessions.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-3">Experience Flowboard in action</h2>
          <p className="text-[15px] text-slate-600 mb-8">Create a workspace and test real-time collaboration across devices.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-slate-950 text-white hover:bg-slate-800 text-[14px] font-medium h-11 px-8 rounded-xl shadow-sm transition-all duration-200"
          >
            Open Canvas
            <ArrowRight size={16} />
          </Link>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}