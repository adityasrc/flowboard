"use client";

import React from "react";

const FlowchartThumbnail = () => (
  <div className="flex items-center gap-1.5 select-none pointer-events-none w-34 justify-center">
    <div className="w-11 h-7 rounded-md border border-blue-200 bg-blue-50/90 shadow-2xs flex flex-col justify-center px-1.5 gap-0.5">
      <div className="w-6 h-1 rounded-full bg-blue-400" />
      <div className="w-4 h-0.5 rounded-full bg-blue-300" />
    </div>
    <div className="flex items-center">
      <div className="w-2.5 h-px bg-slate-300" />
      <div className="w-1 h-1 border-t border-r border-slate-400 rotate-45 -ml-0.5" />
    </div>
    <div className="flex flex-col gap-1">
      <div className="w-9 h-4 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-5 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-9 h-4 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-5 h-0.5 rounded bg-slate-300" />
      </div>
    </div>
  </div>
);

const StickyNotesThumbnail = () => (
  <div className="relative flex items-center justify-center w-34 h-12 select-none pointer-events-none">
    <div className="w-11 h-11 rounded-md border border-slate-200 bg-white shadow-xs -rotate-6 absolute left-5 p-1 flex flex-col justify-between">
      <div className="space-y-0.5">
        <div className="w-6 h-0.5 rounded bg-slate-300" />
        <div className="w-4 h-0.5 rounded bg-slate-200" />
      </div>
      <div className="w-3 h-0.5 rounded bg-slate-200 self-end" />
    </div>
    <div className="w-11 h-11 rounded-md border border-amber-200/90 bg-amber-50 shadow-xs rotate-6 relative z-10 p-1 flex flex-col justify-between">
      <div className="space-y-0.5">
        <div className="w-6 h-0.5 rounded bg-amber-400" />
        <div className="w-7 h-0.5 rounded bg-amber-300" />
        <div className="w-4 h-0.5 rounded bg-amber-300" />
      </div>
      <div className="w-3 h-0.5 rounded bg-amber-400 self-end" />
    </div>
  </div>
);

const KanbanThumbnail = () => (
  <div className="flex items-stretch gap-1.5 w-34 h-12 select-none pointer-events-none justify-center">
    <div className="w-9 rounded-md border border-slate-200 bg-slate-200/50 p-1 flex flex-col gap-1">
      <div className="w-full h-2 rounded bg-white border border-slate-200/80 shadow-2xs" />
      <div className="w-full h-2 rounded bg-white border border-slate-200/80 shadow-2xs" />
    </div>
    <div className="w-9 rounded-md border border-indigo-200/90 bg-indigo-50/70 p-1 flex flex-col gap-1 shadow-xs">
      <div className="w-full h-3 rounded bg-white border border-indigo-200 shadow-2xs flex flex-col justify-center px-0.5">
        <div className="w-4 h-0.5 rounded bg-indigo-400" />
      </div>
      <div className="w-full h-2 rounded bg-white border border-indigo-100 shadow-2xs" />
    </div>
    <div className="w-9 rounded-md border border-slate-200 bg-slate-200/50 p-1 flex flex-col gap-1">
      <div className="w-full h-2 rounded bg-white border border-slate-200/80 shadow-2xs" />
      <div className="w-full h-2 rounded bg-white border border-slate-200/80 shadow-2xs" />
    </div>
  </div>
);

const MindmapThumbnail = () => (
  <div className="flex items-center gap-1.5 w-34 h-12 select-none pointer-events-none justify-center">
    <div className="flex flex-col gap-1.5">
      <div className="w-7 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-3.5 h-0.5 rounded bg-slate-300" />
      </div>
      <div className="w-7 h-3.5 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
        <div className="w-4 h-0.5 rounded bg-slate-300" />
      </div>
    </div>
    <div className="flex flex-col items-center justify-center w-2">
      <div className="w-2 h-px bg-slate-300 -rotate-30 origin-right" />
      <div className="w-2 h-px bg-slate-300 rotate-30 origin-right mt-1.5" />
    </div>
    <div className="w-10 h-6 rounded-md border border-violet-200 bg-violet-50/90 shadow-2xs flex items-center justify-center px-1 gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
      <div className="w-4 h-0.5 rounded bg-violet-400" />
    </div>
    <div className="w-2 h-px bg-slate-300" />
    <div className="w-8 h-4 rounded border border-slate-200 bg-white shadow-2xs flex items-center px-1">
      <div className="w-4.5 h-0.5 rounded bg-slate-300" />
    </div>
  </div>
);

const WireframeThumbnail = () => (
  <div className="w-32 h-12 rounded-md border border-slate-200 bg-white shadow-xs flex flex-col overflow-hidden select-none pointer-events-none">
    <div className="h-2.5 bg-slate-100/90 border-b border-slate-200/80 flex items-center px-1 gap-0.5">
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-1 h-1 rounded-full bg-slate-300" />
      <div className="w-5 h-0.5 rounded bg-slate-200 ml-auto" />
    </div>
    <div className="flex-1 flex p-1 gap-1">
      <div className="w-5 rounded bg-sky-50 border border-sky-200/70 flex flex-col p-0.5 gap-0.5">
        <div className="w-3 h-0.5 rounded bg-sky-400" />
        <div className="w-2 h-0.5 rounded bg-sky-300" />
      </div>
      <div className="flex-1 rounded border border-dashed border-slate-200 flex flex-col justify-center px-1 gap-0.5">
        <div className="w-7 h-0.5 rounded bg-slate-300" />
        <div className="w-4 h-0.5 rounded bg-slate-200" />
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
    <div className="relative flex items-center justify-center w-full h-full">
      <Variant />
    </div>
  );
}
