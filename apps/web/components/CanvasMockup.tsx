"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HTTP_BACKEND } from "@/config";

/**
 * Client-only wrapper for the landing page preview.
 * 
 * Keeps the landing page itself as a Server Component while handling:
 * - backend warm-up
 * - image loading fallback
 */
export function CanvasMockup() {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    void fetch(`${HTTP_BACKEND}/api/v1/health`).catch(() => { });
  }, []);

  return (
    <div className="relative rounded-xl ring-1 ring-black/[0.07] shadow-[0_16px_48px_-8px_rgba(0,0,0,0.13)] bg-white p-[4px]">
      <div className="rounded-lg overflow-hidden bg-[#0a0a0a]">

        <div className="h-9 bg-[#0f0f0f] flex items-center px-3.5">
          <div className="flex gap-1.5 items-center shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="hidden sm:flex items-center px-3 py-[3px] bg-white/[0.05] border border-white/[0.07] rounded text-[11px] font-mono text-slate-500">
              flowboardhq.vercel.app/canvas/live-sync
            </div>
          </div>
          <div className="w-[52px] shrink-0" />
        </div>

        {imgError ? (
          <div className="aspect-video flex items-center justify-center">
            <p className="text-[12px] text-slate-600 font-mono">Preview unavailable</p>
          </div>
        ) : (
          <Image
            src="/actualUI.png"
            alt="Flowboard real-time canvas"
            width={1600}
            height={900}
            className="w-full h-auto block"
            priority
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </div>
  );
}
