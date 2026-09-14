import { GITHUB_URL } from "@/config";
import { BrandMark } from "./BrandMark";

const links = [
  ["GitHub", GITHUB_URL],
  ["LinkedIn", "https://www.linkedin.com/in/adityaprakashio/"],
  ["Resume", "/resume.pdf"],
];

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-slate-50 px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-slate-400">·</span>
          <span className="text-slate-500">
            A real-time collaborative canvas
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500">
          <span className="text-slate-600">Built by Aditya Prakash</span>
          <span className="text-slate-300 select-none">·</span>
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 transition-colors hover:text-slate-950"
            >
              {label}
            </a>
          ))}
          <span className="text-slate-300 select-none">·</span>
          <span className="text-slate-400">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
