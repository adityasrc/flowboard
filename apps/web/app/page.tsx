import Link from "next/link";
import { ArrowRight, GithubIcon, Terminal } from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { CanvasMockup } from "@/components/CanvasMockup";
import { Button } from "@/components/ui/button";

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

          <p className="text-base md:text-lg text-slate-600 max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Collaborative whiteboard built on a custom Node.js WebSocket server and PostgreSQL. No third-party real-time services.
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

          <p className="text-[11.5px] font-mono text-slate-500 mb-8 tracking-wide">
            TypeScript · React / Next.js · Node.js · ws · PostgreSQL · Prisma · Rough.js
          </p>

          <div className="w-full max-w-5xl mx-auto">
            <CanvasMockup />
          </div>
        </section>

        <section className="py-8 md:py-12 px-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-white px-6 py-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="4" cy="8" r="2.5" stroke="#334155" strokeWidth="1.4"/>
                  <circle cx="12" cy="4" r="2.5" stroke="#334155" strokeWidth="1.4"/>
                  <circle cx="12" cy="12" r="2.5" stroke="#334155" strokeWidth="1.4"/>
                  <line x1="6.2" y1="7.1" x2="9.8" y2="4.9" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="6.2" y1="8.9" x2="9.8" y2="11.1" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-950 mb-1.5 tracking-tight">Real-time collaboration</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Shapes and cursors sync instantly across all connected users over a native WebSocket connection.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white px-6 py-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="4" width="12" height="9" rx="1.5" stroke="#334155" strokeWidth="1.4"/>
                  <path d="M5 4V3C5 2.45 5.45 2 6 2H10C10.55 2 11 2.45 11 3V4" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="5" y1="8" x2="11" y2="8" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="5" y1="10.5" x2="8.5" y2="10.5" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-950 mb-1.5 tracking-tight">Persistent canvases</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Every shape is stored in PostgreSQL. Canvases survive refreshes, reconnects, and come back exactly as you left them.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-white px-6 py-5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.5 3H3.5C2.67 3 2 3.67 2 4.5V12.5C2 13.33 2.67 14 3.5 14H11.5C12.33 14 13 13.33 13 12.5V9.5" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M9 2H14V7" stroke="#334155" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="14" y1="2" x2="7.5" y2="8.5" stroke="#334155" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-[14px] font-semibold text-slate-950 mb-1.5 tracking-tight">Shareable rooms</h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Each canvas gets a unique URL. Share it and collaborators join instantly — no sign-up required on their end.
              </p>
            </div>
          </div>
        </section>

        <section className="pt-2 pb-16 md:pb-20 px-6 text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-3">
            Ready to collaborate?
          </h2>
          <p className="text-[15px] text-slate-600 mb-8">
            Create a room, share the URL, and start diagramming with your team instantly. No plugins or installs required.
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
