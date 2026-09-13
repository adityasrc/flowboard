import { Layers } from "lucide-react";

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="rounded-lg bg-slate-950 p-2 transition-colors duration-150 group-hover:bg-slate-800">
        <Layers className="size-3.5 text-white" strokeWidth={2} />
      </span>
      <span className="text-base font-semibold tracking-tight text-slate-950">
        Flowboard
      </span>
    </span>
  );
}
