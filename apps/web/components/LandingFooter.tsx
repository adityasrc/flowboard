import Link from "next/link";
import { Layers } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 py-12 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4">
          
          <div className="flex flex-col gap-3">
             {/* Same premium logo design from the header bas thoda chota size me */}
             <div className="flex items-center gap-2">
                <div className="bg-black p-1 rounded-md">
                  <Layers className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[15px] text-black tracking-tight leading-none mt-0.5">
                  Flowboard
                </span>
            </div>
            
            <p className="text-[13px] text-[#666666] max-w-xs pt-1">
               A real-time whiteboard built to explore low-latency state synchronization and WebSockets.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-3 justify-start pt-1">
            <div className="flex gap-5">
              <a href="https://github.com/adityasrc/flowboard" target="_blank" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">GitHub</a>
              {/* Internal route hai toh next/link use karna hai taaki browser refresh flash na kare */}
              <Link href="/docs" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">Docs</Link>
              <a href="https://github.com/adityasrc/flowboard/issues" target="_blank" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">Issues</a>
            </div>
            <p className="text-[13px] text-slate-400 mt-1 md:mt-2">
              © 2026 Flowboard
            </p>
          </div>
          
      </div>
    </footer>
  );
}