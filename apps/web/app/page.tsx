"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Github } from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";

export default function Index() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-100 antialiased font-sans flex flex-col">
      <LandingHeader />

      <main className="flex-1">
        <section className="pt-24 pb-8 md:pt-32 md:pb-12 px-6 max-w-2xl md:max-w-4xl mx-auto text-center flex flex-col items-center">
          
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[13px] font-medium text-slate-600 mb-8">
            <span className="mr-2">v1.0</span>
            <div className="w-px h-3 bg-slate-200 mx-2"></div>
            <span>MIT Licensed Open Source</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-black leading-[1.1] mb-6">
            Real-time whiteboarding,<br className="hidden md:block" />
            built on native WebSockets.
          </h1>

          <p className="text-[16px] md:text-[18px] text-[#666666] max-w-2xl mx-auto mb-10 leading-relaxed">
            Engineered to avoid Socket.io overhead using native WebSockets. <br className="hidden md:block"/>
            Includes a custom Node.js backend with JWT-based authentication.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-16">

            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white hover:bg-slate-800 text-[14px] font-medium h-10 px-6 rounded-md transition-colors"
            >
              Start drawing
              <ArrowRight size={16} />
            </Link>
            

            <a 
              href="https://github.com/adityasrc/flowboard" 
              target="_blank" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[14px] font-medium text-slate-700 bg-white border border-slate-200 hover:text-black hover:bg-slate-50 h-10 px-6 rounded-md transition-colors"
            >
              <Github size={16}/>
              View source
            </a>
          </div>

          <div className="w-full max-w-5xl mx-auto mb-8">
            <div className="relative p-2 rounded-[2rem] bg-white border border-slate-200 shadow-2xl overflow-hidden mb-3">
              <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                <div className="h-10 bg-slate-50/80 border-b border-slate-100 flex items-center px-5 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="hidden sm:block px-4 py-1 bg-white border border-slate-200/60 rounded text-[10px] text-slate-400">
                    flowboard.app/canvas/bst-implementation
                  </div>
                  <div className="w-12" />
                </div>
                {imgError ? (
                  <div className="aspect-video md:aspect-21/9 flex items-center justify-center">
                    <p className="text-[13px] text-slate-400 font-medium">Actual App UI Screen</p>
                  </div>
                ) : (
                  <img 
                    src="/actualUI.png" 
                    alt="Flowboard Real-time Canvas" 
                    className="w-full h-auto block"
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
            </div>
            <p className="text-[13px] text-slate-400 font-medium tracking-tight">
              Actual app UI — no simulated mockups.
            </p>
          </div>

          <p className="text-[14px] font-medium text-slate-500 tracking-wide mt-2">
            Built with: Next.js · Node.js · ws · PostgreSQL · Prisma · Tailwind
          </p>

        </section>

        <hr className="border-t border-slate-100 my-16 md:my-24 max-w-3xl mx-auto" />

        <section className="px-6 max-w-2xl mx-auto text-center">
          <h2 className="text-[18px] font-semibold text-black mb-3 tracking-tight">Why Flowboard?</h2>
          <p className="text-[16px] text-[#666666] leading-relaxed">
            Most whiteboards optimize for an endless list of features. 
            Flowboard optimizes strictly for latency and simplicity. It's a technical demonstration of handling high-frequency state synchronization without relying on heavy abstractions.
          </p>
        </section>

        <hr className="border-t border-slate-100 my-16 md:my-24 max-w-3xl mx-auto" />

        <section id="features" className="px-6 max-w-3xl mx-auto scroll-mt-24">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-black mb-2">Architecture Decisions</h2>
            <p className="text-[15px] text-[#666666]">The engineering behind the canvas.</p>
          </div>

          <div className="border-l-2 border-slate-100 pl-6 md:pl-8 space-y-12">
            <div>
              <h3 className="text-[16px] font-bold text-black mb-2 tracking-tight">Native WebSockets over Socket.io</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed max-w-2xl">
                Socket.io includes fallback mechanisms that are unnecessary for modern browsers. Using the native `ws` library allows the server to process stringified JSON directly, minimizing latency during high-frequency drawing.
              </p>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-black mb-2 tracking-tight">Custom Canvas Interaction Layer</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed max-w-2xl">
                Built a custom canvas interaction layer from scratch. Utilized Pythagoras theorem for circle-point collision detection and coordinate mapping for pencil-stroke erasure, avoiding heavy 3rd-party canvas libraries.
              </p>
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-black mb-2 tracking-tight">Custom Auth & Persistence</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed max-w-2xl">
                Implemented strict JWT verification on every WebSocket connection. All canvas shapes are stored persistently in PostgreSQL via Prisma, allowing users to rejoin and fetch existing board states instantly.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-t border-slate-100 my-16 md:my-24 max-w-3xl mx-auto" />

        <section className="px-6 max-w-3xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-black mb-2">How It Works</h2>
            <p className="text-[15px] text-[#666666]">The real-time synchronization flow.</p>
          </div>

          <div className="grid gap-8">
            <div className="flex gap-4">
              <div className="text-[13px] font-bold text-slate-400 mt-1">01</div>
              <div>
                <h3 className="text-[15px] font-bold text-black mb-1">Client Captures Input</h3>
                <p className="text-[14px] text-[#666666]">Mouse coordinates and canvas events are batched locally and streamed via WebSockets to prevent overwhelming the server.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-[13px] font-bold text-slate-400 mt-1">02</div>
              <div>
                <h3 className="text-[15px] font-bold text-black mb-1">Server Broadcasts Events</h3>
                <p className="text-[14px] text-[#666666]">The Node.js backend validates incoming payloads against the active room ID and immediately relays updates to connected peers.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-[13px] font-bold text-slate-400 mt-1">03</div>
              <div>
                <h3 className="text-[15px] font-bold text-black mb-1">Clients Reconcile State</h3>
                <p className="text-[14px] text-[#666666]">The Canvas updates the state using optimistic rendering, ensuring the drawing feels instantaneous regardless of network latency.</p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-t border-slate-100 my-16 md:my-24 max-w-3xl mx-auto" />

        <section className="px-6 max-w-3xl mx-auto">
           <div className="mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-black mb-2">Roadmap</h2>
            <p className="text-[15px] text-[#666666]">Future technical improvements.</p>
          </div>
          
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-[14px] text-[#666666]">
              <span className="text-slate-300 mt-1">•</span>
              <span><strong>Redis-backed room scaling:</strong> Moving in-memory room state (`users[]` array) to Redis pub/sub to support horizontal scaling of the WebSocket server.</span>
            </li>
            <li className="flex items-start gap-3 text-[14px] text-[#666666]">
              <span className="text-slate-300 mt-1">•</span>
              <span><strong>Message Queue Integration:</strong> Offloading database writes (Prisma `.create()`) to a queue to prevent DB bottlenecks during heavy collaborative drawing sessions.</span>
            </li>
          </ul>
        </section>

        <hr className="border-t border-slate-100 my-16 md:my-24 max-w-3xl mx-auto" />

        <section className="px-6 pb-24 max-w-2xl mx-auto text-center">
          <h2 className="text-[20px] font-bold tracking-tight text-black mb-4">Ready to test the latency?</h2>
          <p className="text-[15px] text-[#666666] mb-8">Create a room and experience the real-time sync yourself.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center justify-center bg-black text-white hover:bg-slate-800 text-[14px] font-medium h-10 px-8 rounded-md transition-colors"
          >
            Open Canvas
          </Link>
        </section>

      </main>

      <LandingFooter />
    </div>
  );
}