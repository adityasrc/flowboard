"use client";

import React from "react";

const FlowchartThumbnail = () => (
  <div className="flex items-center gap-1.5 select-none pointer-events-none w-34 justify-center">
    <div className="w-7 h-5 rounded-md border border-slate-200 bg-white shadow-2xs flex items-center justify-center px-1">
      <div className="w-4 h-0.5 rounded-full bg-slate-300" />
    </div>

    <div className="flex items-center -mx-0.5">
      <div className="w-2 h-px bg-slate-300" />
      <div className="w-1 h-1 border-t border-r border-slate-400 rotate-45 -ml-0.5" />
    </div>

    <div className="w-5 h-5 rotate-45 rounded-[2px] border border-blue-300 bg-blue-50/90 shadow-2xs flex items-center justify-center shrink-0">
      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 -rotate-45" />
    </div>

    <div className="flex items-center -mx-0.5">
      <div className="w-2 h-px bg-slate-300" />
      <div className="w-1 h-1 border-t border-r border-slate-400 rotate-45 -ml-0.5" />
    </div>

    <div className="flex flex-col gap-1">
      <div className="w-7 h-3 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3.5 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-7 h-3 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-4 h-0.5 rounded bg-slate-300" />
      </div>
    </div>
  </div>
);

const StickyNotesThumbnail = () => (
  <div className="relative flex items-center justify-center w-34 h-13 select-none pointer-events-none">
    <div className="w-11 h-11 rounded-md border border-slate-200 bg-white shadow-xs -rotate-6 absolute left-6 p-1.5 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="w-6 h-0.5 rounded-full bg-slate-300" />
        <div className="w-4 h-0.5 rounded-full bg-slate-200" />
      </div>
      <div className="w-3 h-0.5 rounded-full bg-slate-200 self-end" />
    </div>

    <div className="w-11 h-11 rounded-md border border-amber-300/90 bg-amber-50 shadow-xs rotate-6 relative z-10 p-1.5 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="w-6 h-0.5 rounded-full bg-amber-400" />
        <div className="w-7 h-0.5 rounded-full bg-amber-300" />
        <div className="w-4 h-0.5 rounded-full bg-amber-300" />
      </div>
      <div className="w-3 h-0.5 rounded-full bg-amber-400 self-end" />
    </div>
  </div>
);

const KanbanThumbnail = () => (
  <div className="flex items-stretch gap-1.5 w-34 h-13 select-none pointer-events-none justify-center">
    <div className="w-9 rounded-md border border-slate-200/80 bg-slate-100/60 p-1 flex flex-col gap-1">
      <div className="w-4 h-1 rounded-full bg-slate-300 mb-0.5 mx-0.5" />
      <div className="w-full h-3.5 rounded bg-white border border-slate-200/80 shadow-2xs flex items-center px-1">
        <div className="w-4 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-full h-3.5 rounded bg-white border border-slate-200/80 shadow-2xs flex items-center px-1">
        <div className="w-3 h-0.5 rounded bg-slate-200" />
      </div>
    </div>

    <div className="w-9 rounded-md border border-indigo-200/90 bg-indigo-50/50 p-1 flex flex-col gap-1 shadow-xs">
      <div className="flex items-center gap-1 mb-0.5 mx-0.5">
        <div className="w-1 h-1 rounded-full bg-indigo-500" />
        <div className="w-4 h-1 rounded-full bg-indigo-400" />
      </div>
      <div className="w-full h-4 rounded bg-white border border-indigo-200 shadow-2xs flex flex-col justify-center px-1 gap-0.5">
        <div className="w-5 h-0.5 rounded bg-indigo-500" />
        <div className="w-3 h-0.5 rounded bg-indigo-300" />
      </div>
    </div>

    <div className="w-9 rounded-md border border-slate-200/80 bg-slate-100/60 p-1 flex flex-col gap-1">
      <div className="w-4 h-1 rounded-full bg-slate-300 mb-0.5 mx-0.5" />
      <div className="w-full h-3.5 rounded bg-white border border-slate-200/80 shadow-2xs flex items-center px-1">
        <div className="w-4 h-0.5 rounded bg-slate-300" />
      </div>
    </div>
  </div>
);

const MindmapThumbnail = () => (
  <div className="flex items-center gap-1.5 w-34 h-13 select-none pointer-events-none justify-center">
    <div className="flex flex-col gap-1.5 items-end">
      <div className="w-6 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-6 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3.5 h-0.5 rounded bg-slate-300" />
      </div>
    </div>

    <div className="flex flex-col items-center justify-center w-1.5">
      <div className="w-1.5 h-px bg-slate-300 -rotate-30 origin-right" />
      <div className="w-1.5 h-px bg-slate-300 rotate-30 origin-right mt-2" />
    </div>

    <div className="w-8 h-5.5 rounded-md border border-violet-300 bg-violet-50/90 shadow-2xs flex items-center justify-center px-1 gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
      <div className="w-3.5 h-0.5 rounded bg-violet-400" />
    </div>

    <div className="flex flex-col items-center justify-center w-1.5">
      <div className="w-1.5 h-px bg-slate-300 rotate-30 origin-left" />
      <div className="w-1.5 h-px bg-slate-300 -rotate-30 origin-left mt-2" />
    </div>

    <div className="flex flex-col gap-1.5 items-start">
      <div className="w-6 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3.5 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-6 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3 h-0.5 rounded bg-slate-300" />
      </div>
    </div>
  </div>
);

const WireframeThumbnail = () => (
  <div className="w-32 h-13 rounded-md border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden select-none pointer-events-none">
    <div className="h-3 bg-slate-100/90 border-b border-slate-200/80 flex items-center px-1.5 gap-1">
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-6 h-1 rounded-full bg-slate-200 ml-auto" />
    </div>

    <div className="flex-1 flex p-1 gap-1">
      <div className="w-6 rounded bg-slate-50 border border-slate-200/60 flex flex-col p-0.5 gap-0.5">
        <div className="w-3.5 h-0.5 rounded bg-slate-300" />
        <div className="w-2.5 h-0.5 rounded bg-slate-200" />
        <div className="w-3 h-0.5 rounded bg-slate-200" />
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <div className="w-full h-1.5 rounded bg-slate-100" />
        <div className="grid grid-cols-2 gap-1 flex-1">
          <div className="rounded border border-sky-200/80 bg-sky-50/50 p-0.5 flex flex-col justify-center">
            <div className="w-3.5 h-0.5 rounded bg-sky-400 mx-auto" />
          </div>
          <div className="rounded border border-dashed border-slate-200 bg-white p-0.5 flex flex-col justify-center">
            <div className="w-3.5 h-0.5 rounded bg-slate-300 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const variants = [
  FlowchartThumbnail,
  StickyNotesThumbnail,
  KanbanThumbnail,
  MindmapThumbnail,
  WireframeThumbnail,
];

export function CanvasThumbnail({ slug }: { slug: string }) {
  const hash = slug.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const patternIndex = hash % variants.length;
  const Variant = variants[patternIndex] || FlowchartThumbnail;

  return (
    <div className="relative flex items-center justify-center w-full h-full scale-[0.91]">
      <Variant />
    </div>
  );
}
