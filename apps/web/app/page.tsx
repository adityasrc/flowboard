"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Menu, X, Map, Zap, Code, MousePointer2, 
  Pencil, Github, ArrowRight, Type, Minus, Square, Circle, Triangle 
} from "lucide-react";

/* ─── Animation Logic for Cursors ─── */
const cursorPaths = {
  alex: { x: [40, 180, 260, 150, 80, 40], y: [60, 120, 60, 180, 140, 60] },
  sam: { x: [300, 200, 100, 220, 320, 300], y: [160, 80, 140, 200, 100, 160] },
};

/* ─── Component: The "Mast" Toolbar Mockup ─── */
const WhiteboardMockup = () => {
  // State for the fake toolbar interaction
  const [activeTool, setActiveTool] = useState("rectangle");
  const [alexPos, setAlexPos] = useState({ x: 40, y: 60 });
  const [samPos, setSamPos] = useState({ x: 300, y: 160 });

  // Cursor Animation Loop
  useEffect(() => {
    let alexIdx = 0;
    let samIdx = 0;
    const interval = setInterval(() => {
      alexIdx = (alexIdx + 1) % cursorPaths.alex.x.length;
      samIdx = (samIdx + 1) % cursorPaths.sam.x.length;
      setAlexPos({ x: cursorPaths.alex.x[alexIdx], y: cursorPaths.alex.y[alexIdx] });
      setSamPos({ x: cursorPaths.sam.x[samIdx], y: cursorPaths.sam.y[samIdx] });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-4xl">
       {/* Soft Glow Behind the Card */}
       <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl blur-2xl opacity-50"></div>
       
       <div className="relative rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden h-[360px] sm:h-[480px]">
         
         {/* ─── THE "MAST" TOOLBAR (Floating Dark Dock) ─── */}
         <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
           <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900/95 backdrop-blur-md shadow-2xl border border-gray-700/50">
             
             {/* Selection Tool */}
             <button 
                onClick={() => setActiveTool("select")}
                className={`p-2 rounded-lg transition-all ${activeTool === "select" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-400 hover:text-white hover:bg-gray-800"}`}
             >
               <MousePointer2 size={18} />
             </button>

             {/* Separator */}
             <div className="w-px h-5 bg-gray-700 mx-1"></div>

             {/* Tools List */}
             {[
               { id: "rectangle", icon: <Square size={18} /> },
               { id: "circle", icon: <Circle size={18} /> },
               { id: "diamond", icon: <Triangle size={18} /> },
               { id: "arrow", icon: <ArrowRight size={18} /> },
               { id: "line", icon: <Minus size={18} /> },
               { id: "pencil", icon: <Pencil size={18} /> },
               { id: "text", icon: <Type size={18} /> },
             ].map((tool) => (
               <button
                 key={tool.id}
                 onClick={() => setActiveTool(tool.id)}
                 className={`p-2 rounded-lg transition-all duration-200 ${
                   activeTool === tool.id
                     ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)] ring-1 ring-cyan-500/30" // ✨ The "Active" Glow
                     : "text-gray-400 hover:text-white hover:bg-gray-800"
                 }`}
               >
                 {tool.icon}
               </button>
             ))}
           </div>
         </div>

         {/* ─── Canvas Area ─── */}
         <div className="relative w-full h-full bg-white"
              style={{ backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)", backgroundSize: "20px 20px" }}>
           
           {/* SVG Animations (Drawing Effect) */}
           <svg className="absolute inset-0 w-full h-full pointer-events-none">
               {/* Rectangle Match with Toolbar */}
               <rect x="25%" y="30%" width="20%" height="25%" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="10 10" rx="2" className="opacity-80">
                   <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="20s" repeatCount="indefinite" />
               </rect>
               
               <circle cx="60%" cy="45%" r="10%" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeDasharray="5 5" className="opacity-80">
                    <animate attributeName="stroke-dashoffset" from="500" to="0" dur="30s" repeatCount="indefinite" />
               </circle>

               <path d="M 45% 42% L 50% 45%" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrowhead)" />
           </svg>

           {/* User Labels */}
           <div className="absolute top-[30%] left-[25%] -translate-x-full -translate-y-full px-2 py-1 bg-blue-500 text-white text-[10px] rounded font-bold shadow-sm z-10">
             component.tsx
           </div>
           
           {/* Cursor: Alex */}
           <div className="absolute transition-all duration-[2000ms] ease-in-out z-10"
                style={{ transform: `translate(${alexPos.x}px, ${alexPos.y}px)` }}>
             <MousePointer2 className="text-blue-600 fill-blue-600 transform -rotate-12 drop-shadow-md" size={24} />
             <span className="ml-4 -mt-6 block bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
               Alex
             </span>
           </div>

           {/* Cursor: Sam */}
           <div className="absolute transition-all duration-[2000ms] ease-in-out z-10"
                style={{ transform: `translate(${samPos.x}px, ${samPos.y}px)` }}>
             <MousePointer2 className="text-purple-600 fill-purple-600 transform -rotate-12 drop-shadow-md" size={24} />
             <span className="ml-4 -mt-6 block bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
               Sam
             </span>
           </div>
         </div>
       </div>
    </div>
  );
};

/* ─── Main Page Component ─── */
const Index = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─── Background Grid ─── */}
      <div className="fixed inset-0 pointer-events-none" 
           style={{
             backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
             backgroundSize: "24px 24px",
           }} 
      />

      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-4">
          
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
             <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shadow-sm">
              <Pencil size={18} strokeWidth={2.5} />
            </div>
            <span>Flowboard</span>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/signin" className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all">
              Sign In
            </Link>
            <Link href="/signup" className="px-6 py-2.5 rounded-full text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              Get Started
            </Link>
          </div>
          
          <button className="md:hidden text-gray-900" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-3 bg-white shadow-xl">
            <Link href="/signin" className="px-5 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Sign In</Link>
            <Link href="/signup" className="px-5 py-3 rounded-lg text-sm font-bold bg-blue-600 text-white text-center">Get Started</Link>
          </div>
        )}
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-500 mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Open Source & MIT Licensed
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.15] mb-6">
            Collaborative Sketching at the <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent pb-2">
              Speed of Thought
            </span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            A low-latency, open-source whiteboard built for developers. <br className="hidden md:block"/>
            Real-time sync powered by WebSockets and Next.js.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/signup" className="px-8 py-4 rounded-full text-base font-bold bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 transition-all shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2">
              Start Drawing Free <ArrowRight size={18} />
            </Link>
            <a href="https://github.com/adityasrc" target="_blank" className="px-8 py-4 rounded-full text-base font-bold bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
              <Github size={18}/> GitHub
            </a>
          </div>

          {/* ─── Insert Mockup Component ─── */}
          <WhiteboardMockup />

        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="py-12 border-y border-gray-100 bg-gray-50/50">
        <div className="container mx-auto px-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Powered by modern tech</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                {["Next.js", "PostgreSQL", "Prisma", "WebSockets", "Tailwind"].map((tech) => (
                    <span key={tech} className="text-lg sm:text-xl font-bold text-gray-800 cursor-default">{tech}</span>
                ))}
            </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Built for Speed</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
                No bloat. Just the tools you need to get ideas from your brain to the screen.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap size={24}/>, color: "text-blue-600", bg: "bg-blue-50", title: "Turbo Performance", desc: "Powered by Turborepo. Loads in milliseconds, even with massive boards." },
              { icon: <Map size={24}/>, color: "text-purple-600", bg: "bg-purple-50", title: "Infinite Canvas", desc: "Zoom, pan, and scroll endlessly. No boundaries, no limits." },
              { icon: <Code size={24}/>, color: "text-green-600", bg: "bg-green-50", title: "Open Source", desc: "Fork it. Self-host it. Extend it. The code is yours." }
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-6 ${f.color} group-hover:scale-110 transition-transform`}>
                      {f.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 font-bold text-gray-900">
                <Pencil size={16} className="text-blue-600" /> Flowboard
            </div>
            <p className="text-sm text-gray-500">© 2026 Flowboard. Apache 2.0 License.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;