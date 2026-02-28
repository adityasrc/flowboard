"use client"

import Link from "next/link"
import { Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { MouseEvent } from "react"

export function LandingHeader() {
  const router = useRouter();

  const scrollToFeatures = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("features");
    elem?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] transition-all">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
        
        <div className="flex items-center">
          <Link href="/" aria-label="Flowboard home" className="flex items-center gap-2.5 group">
            <Layers className="h-5 w-5 text-black transition-transform group-hover:rotate-12" strokeWidth={2.5} />
            <span className="font-bold text-[18px] md:text-[19px] tracking-tight text-black">
              Flowboard
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <a 
            href="#features" 
            onClick={scrollToFeatures} 
            className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors cursor-pointer"
          >
            Features
          </a>
          <Link href="https://github.com/adityasrc/flowboard" target="_blank" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">
            GitHub
          </Link>
          <Link href="/docs" className="text-[13px] font-medium text-[#666666] hover:text-black transition-colors">
            Docs
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            variant="outline" 
            size="sm"
            className="text-[13px] font-medium text-slate-600 hover:text-black cursor-pointer border-slate-200 h-9 px-3 md:px-4"
            onClick={() => router.push("/signin")}
          >
            Log In
          </Button>
          <Button 
            size="sm"
            className="bg-black text-white hover:bg-slate-800 text-[13px] font-medium h-9 px-3 md:px-4 rounded-md shadow-[0_1px_0_0_rgba(0,0,0,0.04)] cursor-pointer"
            onClick={() => router.push("/signup")}
          >
            Sign Up
          </Button>
        </div>

      </div>
    </header>
  )
}