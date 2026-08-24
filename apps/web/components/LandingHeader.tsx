"use client"

import Link from "next/link"
import { Layers, Menu, X, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  useEffect(() => {
    const syncAuthState = () => {
      try {
        const token = localStorage.getItem("token");
        setIsLoggedIn(Boolean(token));
      } catch {
        setIsLoggedIn(false);
      }
    };
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);


  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-200 ${isScrolled
        ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-14">


        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-black p-[7px] rounded-lg transition-all duration-150 group-hover:bg-slate-800">
            <Layers className="h-[14px] w-[14px] text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-black">
            Flowboard
          </span>
        </Link>





        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <Button asChild className="h-7 px-3 gap-1.5 text-[12.5px]">
              <Link href="/dashboard">
                Dashboard <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          ) : (
            <>
              <Button asChild className="h-7 px-3 text-[12.5px]" variant="ghost">
                <Link href="/signin">Log in</Link>
              </Button>
              <Button asChild className="h-7 px-3 text-[12.5px]">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>


        <button
          className="md:hidden flex items-center justify-center w-8 h-8 text-slate-600 hover:text-black transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>


      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100">
          <nav className="flex flex-col px-6 py-8 gap-1">

            <div className="flex flex-col gap-3 mt-6">
              {isLoggedIn ? (
                <Button asChild className="w-full gap-1.5 h-10">
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button asChild className="w-full h-10" variant="outline">
                    <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className="w-full h-10">
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
