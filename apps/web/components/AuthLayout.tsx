import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/BrandMark";

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  bottomPrompt: string;
  bottomLinkText: string;
  bottomLinkHref: string;
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  bottomPrompt,
  bottomLinkText,
  bottomLinkHref,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950 selection:bg-slate-200">
      <header className="border-b border-slate-200/80 px-6">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2"
            aria-label="Flowboard home"
          >
            <BrandMark />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center px-6 py-16 sm:py-20">
        <section className="mx-auto w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-medium text-slate-500">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
          </div>

          {children}

          <p className="mt-6 text-center text-sm text-slate-500">
            {bottomPrompt}{" "}
            <Link
              href={bottomLinkHref}
              className="font-medium text-slate-950 underline-offset-4 hover:underline"
            >
              {bottomLinkText}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
