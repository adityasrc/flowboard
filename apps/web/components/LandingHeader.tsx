"use client"

import Link from "next/link"
import { Layers, Menu, X, ArrowRight } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { MouseEvent } from "react"

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token && token !== "undefined" && token !== "null") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Doosre tabs mein login/logout hone par sync rahega
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const scrollToFeatures = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("features");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm py-3" 
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-black p-1.5 rounded-xl transition-transform group-hover:rotate-6">
              <Layers className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[20px] tracking-tight text-black">
              Flowboard
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <a 
            href="#features" 
            onClick={scrollToFeatures} 
            className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors"
          >
            Features
          </a>
          <Link 
            href="https://github.com/adityasrc/flowboard" 
            target="_blank" 
            className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors"
          >
            GitHub
          </Link>
          <Link 
            href="/docs" 
            className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Auth Actions: Yahan logic dynamic hai */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-full" />
          ) : isLoggedIn ? (
            <Button size="sm" className="bg-black text-white hover:bg-slate-800 rounded-full px-5 transition-all shadow-md" asChild>
              <Link href="/dashboard">
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="text-[13px] font-medium text-slate-600 hover:text-black" asChild>
                <Link href="/signin">Log In</Link>
              </Button>
              <Button size="sm" className="bg-black text-white hover:bg-slate-800 text-[13px] font-medium rounded-full px-5 shadow-lg hover:shadow-black/20 transition-all" asChild>
                <Link href="/signup">Sign Up Free</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-white/95 backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-8 gap-8">
            <a href="#features" onClick={scrollToFeatures} className="text-xl font-semibold text-slate-900">Features</a>
            <Link href="/docs" className="text-xl font-semibold text-slate-900">Docs</Link>
            <Link href="https://github.com/adityasrc/flowboard" className="text-xl font-semibold text-slate-900">GitHub</Link>
            
            <div className="flex flex-col gap-4 mt-4 border-t border-slate-100 pt-8">
              {isLoggedIn ? (
                <Button className="w-full py-6 text-lg bg-black text-white rounded-xl" asChild>
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="w-full py-6 text-lg rounded-xl" asChild>
                    <Link href="/signin" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                  </Button>
                  <Button className="w-full py-6 text-lg bg-black text-white rounded-xl" asChild>
                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}