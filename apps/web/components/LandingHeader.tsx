"use client";

import Link from "next/link";
import { ArrowRight, GithubIcon, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/config";
import { BrandMark } from "./BrandMark";

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    const syncAuthState = () =>
      setIsLoggedIn(Boolean(window.localStorage.getItem("token")));
    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${isScrolled ? "border-b border-slate-200/80 bg-slate-50/90 backdrop-blur" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2"
          aria-label="Flowboard home"
        >
          <BrandMark />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-950"
          >
            <GithubIcon className="size-4" />
            Source
          </a>
          {isLoggedIn ? (
            <Button asChild size="sm" className="ml-2 gap-1.5 rounded-md">
              <Link href="/dashboard">
                Dashboard <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="ml-2 rounded-md"
              >
                <Link href="/signin">Log in</Link>
              </Button>
              <Button asChild size="sm" className="rounded-md">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
        <button
          className="flex size-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-950 md:hidden"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
      </div>
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="border-t border-slate-200 bg-slate-50 px-6 py-6 md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              onClick={closeMenu}
              className="flex h-10 items-center gap-2 text-sm font-medium text-slate-600"
            >
              <GithubIcon className="size-4" />
              View source
            </a>
            {isLoggedIn ? (
              <Button asChild className="w-full gap-1.5" onClick={closeMenu}>
                <Link href="/dashboard">
                  Dashboard <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" onClick={closeMenu}>
                  <Link href="/signin">Log in</Link>
                </Button>
                <Button asChild onClick={closeMenu}>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
