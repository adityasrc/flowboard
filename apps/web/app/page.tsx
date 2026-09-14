import Link from "next/link";
import {
  ArrowRight,
  GithubIcon,
  Save,
  Share2,
  Terminal,
  Users,
} from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFooter } from "@/components/LandingFooter";
import { CanvasMockup } from "@/components/CanvasMockup";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/config";

const benefits = [
  {
    icon: Users,
    eyebrow: "Live collaboration",
    title: "Work in the same space, at the same time.",
    description:
      "Shapes, edits, and cursors move together, so the conversation never drifts away from the work.",
  },
  {
    icon: Save,
    eyebrow: "Persistent by default",
    title: "Pick up exactly where you left off.",
    description:
      "Every canvas is saved as you work. Refresh, reconnect, and return to the same canvas without losing the thread.",
  },
  {
    icon: Share2,
    eyebrow: "Built to share",
    title: "One link is all your team needs.",
    description:
      "Create a canvas, send its unique URL, and bring people onto the same canvas in a moment.",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a canvas",
    description: "Start with an empty, persistent canvas for your idea.",
  },
  {
    step: "02",
    title: "Invite your team",
    description:
      "Share the canvas URL with the people you want in the conversation.",
  },
  {
    step: "03",
    title: "Think out loud",
    description:
      "Sketch, map, and refine together while every change stays in sync.",
  },
];

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-950 selection:bg-slate-200">
      <LandingHeader />
      <main className="flex-1">
        <section className="border-b border-slate-200/80 px-6 pb-20 pt-28 sm:pt-36 lg:pb-28">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="animate-fade-in-up mb-6 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                <span className="h-px w-6 bg-slate-300" />A shared space for
                ideas
                <span className="h-px w-6 bg-slate-300" />
              </p>
              <h1
                className="animate-fade-in-up text-balance text-5xl font-semibold tracking-tighter text-slate-950 sm:text-6xl lg:text-7xl"
                style={{ animationDelay: "80ms" }}
              >
                Make the messy part of thinking feel shared.
              </h1>
              <p
                className="animate-fade-in-up mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-slate-600 sm:text-lg"
                style={{ animationDelay: "160ms" }}
              >
                Flowboard is a real-time collaborative whiteboard for sketching
                ideas, mapping systems, and thinking together.
              </p>
              <div
                className="animate-fade-in-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <Button
                  asChild
                  size="lg"
                  className="w-full gap-2 rounded-lg sm:w-auto"
                >
                  <Link href="/signup">
                    Start drawing <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 rounded-lg bg-white sm:w-auto"
                >
                  <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                    <GithubIcon className="size-4" />
                    View source
                  </a>
                </Button>
              </div>
              <p
                className="animate-fade-in-up mt-6 text-xs text-slate-500"
                style={{ animationDelay: "320ms" }}
              >
                Free account. Takes a few seconds to get started.
              </p>
            </div>
            <div className="animate-float mt-14 lg:mt-16">
              <CanvasMockup />
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-6 py-20 text-white sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="flex size-10 items-center justify-center rounded-lg bg-white/10 text-slate-200">
                <Terminal className="size-4" />
              </div>
              <p className="mt-8 text-sm font-medium text-slate-400">
                Builder&apos;s note
              </p>
              <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
                A small stack, built to be understood end-to-end.
              </h2>
            </div>
            <div className="border-t border-white/15 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
              <p className="text-base leading-7 text-slate-300">
                I built Flowboard to explore real-time collaboration from first
                principles without relying on hosted BaaS middlemen. It pairs a
                custom Node.js WebSocket server for low-latency canvas events
                with PostgreSQL for durable rooms, while the canvas renderer
                draws directly using the 2D canvas API and Rough.js.
              </p>
              <div className="mt-7 flex flex-wrap gap-2 text-xs font-medium text-slate-300">
                {[
                  "TypeScript",
                  "Next.js",
                  "Node.js",
                  "ws",
                  "PostgreSQL",
                  "Prisma",
                  "Rough.js",
                ].map((technology) => (
                  <span
                    key={technology}
                    className="rounded-md border border-white/15 px-2.5 py-1.5"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 border-b border-slate-200 pb-12 md:grid-cols-2 md:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  A canvas that keeps up
                </p>
                <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Everything you need to stay in the flow.
                </h2>
              </div>
              <p className="max-w-md text-base leading-7 text-slate-600 md:justify-self-end">
                The interface stays out of the way, leaving room for rough
                diagrams, clear decisions, and the people making them.
              </p>
            </div>
            <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {benefits.map(
                ({ icon: Icon, eyebrow, title, description }, index) => (
                  <article
                    key={title}
                    className="py-10 md:px-8 md:py-12 first:md:pl-0 last:md:pr-0"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700">
                      <Icon className="size-4" strokeWidth={1.75} />
                    </div>
                    <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                      0{index + 1} · {eyebrow}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="px-6 pb-20 pt-14 sm:pb-28 sm:pt-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-sm font-medium text-slate-500">
                From an empty canvas to a shared plan
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Get everyone on the same page.
              </h2>
            </div>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {steps.map(({ step, title, description }) => (
                <li
                  key={step}
                  className="relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div>
                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-medium text-slate-500">
                      Step {step}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl rounded-xl border border-slate-200/80 bg-white px-10 py-14 text-center shadow-sm md:py-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Your next idea needs a little room.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
              Create a canvas, bring in your collaborators, and let the first
              draft be imperfect.
            </p>
            <Button asChild size="lg" className="mt-8 gap-2 rounded-lg">
              <Link href="/signup">
                Create a canvas <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>
      <LandingFooter />
    </div>
  );
}
