

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 py-12 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4">
          <div className="flex flex-col gap-2">
             <div className="font-bold text-[15px] text-black tracking-tight">
                Flowboard
            </div>
            <p className="text-[13px] text-[#666666] max-w-xs">
               An open-source collaborative whiteboard focused on low-latency state synchronization.
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <div className="flex gap-4">
              <a href="https://github.com/adityasrc/flowboard" target="_blank" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">GitHub</a>
              <a href="/docs" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">Docs</a>
              <a href="https://github.com/adityasrc/flowboard/issues" target="_blank" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">Issues</a>
            </div>
            <p className="text-[13px] text-slate-400 mt-2">
              © 2026 Flowboard · MIT License
            </p>
          </div>
      </div>
    </footer>
  );
}