"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function CanvasMockup() {
  const [imgError, setImgError] = useState(false);

  // Warm up backend before user opens a canvas
  useEffect(() => {
    void api.get("/api/v1/health").catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-300 bg-white p-1 shadow-xl shadow-slate-200/70">
      <div className="overflow-hidden rounded-lg bg-slate-950">
        <div className="flex h-10 items-center bg-slate-950 px-4">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-red-400" />
            <div className="size-2.5 rounded-full bg-amber-300" />
            <div className="size-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="flex flex-1 justify-center">
            <div className="hidden rounded-md border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-slate-500 sm:flex sm:items-center">
              flowboard.app/canvas/brainstorm
            </div>
          </div>
          <div className="w-12 shrink-0" />
        </div>

        {imgError ? (
          <div className="flex aspect-video items-center justify-center">
            <p className="font-mono text-xs text-slate-600">
              Preview unavailable
            </p>
          </div>
        ) : (
          <Image
            src="/actualUI.png"
            alt="Flowboard real-time canvas"
            width={1600}
            height={900}
            className="block h-auto w-full"
            priority
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}
