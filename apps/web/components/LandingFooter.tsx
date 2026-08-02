import { Layers } from "lucide-react";

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-5 py-9">

        {/* 
          * Desktop layout keeps the brand and copyright pinned to the edges, 
          * allowing the social links to remain visually centered regardless 
          * of the width of the side content.
          * Mobile stacks everything vertically. 
          */}
        <div className="flex flex-col items-center gap-5 sm:relative sm:flex-row sm:justify-center sm:items-center sm:gap-0">

          {/* Brand — absolute left on sm+ */}
          <div className="flex items-center gap-2.5 sm:absolute sm:left-0">
            <div className="bg-black p-[6px] rounded-md shrink-0">
              <Layers className="h-3.5 w-3.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <span className="font-semibold text-sm text-black tracking-tight leading-none block">
                Flowboard
              </span>
              <span className="text-xs text-slate-400 font-mono leading-tight block mt-0.5">
                Engineering Portfolio
              </span>
            </div>
          </div>

          {/* Social links — truly centered */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/adityasrc"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/adityaprakashio/"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
            >
              LinkedIn
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-500 hover:text-black transition-colors duration-150"
            >
              Resume
            </a>
          </div>

          {/* Copyright — absolute right on sm+ */}
          <p className="text-xs font-mono text-slate-300 sm:absolute sm:right-0">
            &copy; {currentYear} Flowboard
          </p>

        </div>
      </div>
    </footer>
  );
}
