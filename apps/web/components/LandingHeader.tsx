"use client"

import Link from "next/link"
import { Layers, Menu, X, ArrowRight } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import React from "react" // Needed for React.MouseEvent

export function LandingHeader() {
 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Loading state prevents the UI from "flashing" a Login button before finding the token
  const [isLoading, setIsLoading] = useState(true);

  
  
  // 1. Scroll Listener (For the frosted glass effect on the Navbar)
  useEffect(() => {
    const handleScroll = () => {
      // Agar user 20px se zyada neche scroll kare, toh Navbar ka style change kardo
      setIsScrolled(window.scrollY > 20);
    };
    

    window.addEventListener("scroll", handleScroll);
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Auth Listener (For checking user session across tabs)
  useEffect(() => {
    const checkAuth = () => {
      // localStorage check directly on client-side
      const token = localStorage.getItem("token");
      
      // Edge case rule: sometimes token string is set to "undefined" or "null".
      if (token && token !== "undefined" && token !== "null") {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setIsLoading(false); // Auth check is complete
    };

    checkAuth();

    // Trick for Interview: Agar user multiple tabs use kar raha hai, 
    // toh 'storage' event tab trigger hota hai jab data change ho (logout or login). 
    // Ye line ensure karti hai dono tabs me header instantly sync ho jaye.
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  
  // Smoothly scroll to the standard 'Features' section
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("features");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false); // Click hone ke baad mobile menu band kar do
    }
  };



  // Using dynamic classes. Agar scrolled true hai -> Frosted Nav. Nahi toh -> Transparent Nav.
  const navBackgroundClass = isScrolled 
    ? "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm py-3" 
    : "bg-transparent border-b border-transparent py-5";

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${navBackgroundClass}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        
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

        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <a href="#features" onClick={scrollToFeatures} className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors">
            Features
          </a>
          <Link href="https://github.com/adityasrc/flowboard" target="_blank" className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors">
            GitHub
          </Link>
          <Link href="/docs" className="text-[13px] font-medium text-slate-500 hover:text-black transition-colors">
            Docs
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          
          {isLoading ? (
            /*  Dikhao loader jab token check ho raha ho */
            <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-full" />
            
          ) : isLoggedIn ? (
            /* Agar logged in, toh directly Dashboard pr bhej do */
            <Button size="sm" className="bg-black text-white hover:bg-slate-800 rounded-full px-5 transition-all shadow-md" asChild>
              <Link href="/dashboard">
                Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
          ) : (
            /* Default Auth Buttons: Not Logged in */
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

        <button 
          className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-40 bg-white/95 backdrop-blur-lg animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-8 gap-8">
            <a href="#features" onClick={scrollToFeatures} className="text-xl font-semibold text-slate-900">Features</a>
            <Link href="/docs" className="text-xl font-semibold text-slate-900">Docs</Link>
            <Link href="https://github.com/adityasrc/flowboard" target="_blank" className="text-xl font-semibold text-slate-900">GitHub</Link>
            
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