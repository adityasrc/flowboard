"use client";


import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Signup from "./signup/page";
import { ArrowRight, Layers, Zap, LayoutGrid, Users, Moon, Github } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* --- BACKGROUND GRID PATTERN --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between w-full max-w-3xl shadow-2xl">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <LayoutGrid className="w-5 h-5 text-white" />
            </div>
            Flowboard
          </div>
          <div className="flex items-center gap-4">
            <Link href="/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition hidden sm:block">
              Log in
            </Link>

            <Button size="sm" className="bg-white text-black hover:bg-zinc-200 font-semibold">
              Sign up
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        
        {/* --- HERO SECTION --- */}
        <div className="mb-8 animate-fade-in-up">
            {/* SHADCN BADGE HERE */}
            <Badge variant="outline" className="px-4 py-1.5 border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 gap-2 font-normal rounded-full transition-colors cursor-default">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                v1.0 is now live for developers
            </Badge>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500">
          Think better, <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            draw together.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          The infinite canvas for engineering teams. Wireframe, diagram, and brainstorm in real-time with zero latency using WebSockets.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-24 w-full sm:w-auto">
          {/* SHADCN BUTTONS HERE */}
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white h-12 px-8 text-base shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
            Start Drawing Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="h-12 px-8 text-base border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white">
            <Github className="mr-2 w-4 h-4" /> Star on GitHub
          </Button>
        </div>

        {/* --- APP MOCKUP --- */}
        <div className="w-full max-w-5xl mx-auto relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            
            <div className="relative rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur shadow-2xl overflow-hidden aspect-video md:aspect-[16/9] lg:aspect-[2/1] transform transition-transform duration-500 hover:scale-[1.01]">
                {/* Mockup Toolbar */}
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-2 bg-zinc-900">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div className="ml-auto flex gap-4 text-xs text-zinc-500 font-mono">
                        <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</div>
                    </div>
                </div>

                {/* Mockup Canvas Area */}
                <div className="p-8 grid grid-cols-2 gap-8 h-full relative bg-zinc-950/50">
                     {/* Grid lines inside mockup */}
                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] opacity-50"></div>

                    {/* Fake Elements */}
                    <div className="absolute top-10 left-10 w-40 h-24 border border-indigo-500/50 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        Auth Service
                    </div>
                    
                    <svg className="absolute top-20 left-52 w-32 h-2 text-zinc-600" fill="none">
                         <path d="M0 0 L100 0" stroke="currentColor" strokeDasharray="4 4"/>
                    </svg>

                    <div className="absolute top-16 left-80 w-40 h-40 border border-purple-500/50 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        PostgreSQL
                    </div>
                    
                    {/* Cursor */}
                    <div className="absolute top-24 left-40 z-10">
                        <svg className="w-6 h-6 text-yellow-400 fill-current drop-shadow-md" viewBox="0 0 24 24"><path d="M5.658 2.396a.75.75 0 01.696.068l14.5 9.5a.75.75 0 01-0.29 1.378l-5.694.95 2.85 5.587a.75.75 0 01-1.336.682l-2.85-5.588-3.79 4.42A.75.75 0 013 18.847V3a.75.75 0 01.658-1.604z"/></svg>
                        <span className="bg-yellow-400 text-black text-[10px] px-1.5 py-0.5 rounded ml-4 font-bold shadow-sm">Rumi</span>
                    </div>
                </div>
            </div>
        </div>

        {/* --- FEATURES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mt-32 mb-20">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 transition duration-300 group hover:bg-zinc-900/80">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/20 transition">
                 <Zap className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition" />
            </div>
            <h3 className="text-xl font-bold mb-2">Zero Latency</h3>
            <p className="text-zinc-400 text-sm">Powered by WebSockets. Every stroke is synced instantly across all clients.</p>
          </div>
          
          {/* Card 2 (Wide) */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-purple-500/30 transition duration-300 group hover:bg-zinc-900/80 flex flex-col justify-center">
             <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition">
                    <Users className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-xl font-bold">Multiplayer Collaboration</h3>
             </div>
            <p className="text-zinc-400 text-sm">Work with unlimited team members on the same board. See cursors, chat, and ideate together.</p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-pink-500/30 transition duration-300 group hover:bg-zinc-900/80">
             <div className="w-12 h-12 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/20 transition">
                <Layers className="w-6 h-6 text-pink-400 group-hover:scale-110 transition" />
            </div>
            <h3 className="text-xl font-bold">Infinite Canvas</h3>
            <p className="text-zinc-400 text-sm">Never run out of space. Pan and zoom infinitely to map out huge architectures.</p>
          </div>

           {/* Card 4 */}
           <div className="md:col-span-2 md:col-start-2 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-green-500/30 transition duration-300 group hover:bg-zinc-900/80">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition">
                    <Moon className="w-6 h-6 text-green-400 group-hover:scale-110 transition" />
                </div>
                <h3 className="text-xl font-bold">Dark Mode Native</h3>
             </div>
            <p className="text-zinc-400 text-sm">Designed for late-night coding sessions. Easy on the eyes, high on contrast.</p>
          </div>
        </div>

      </main>
    </div>
  );
}