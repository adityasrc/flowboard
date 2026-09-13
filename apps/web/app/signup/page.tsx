"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { api, isAxiosError } from "@/lib/api";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = nameRef.current?.value.trim();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/v1/auth/signup", {
        name,
        email,
        password,
      });

      // Automatically sign in after signup
      try {
        const signinRes = await api.post<{ token: string }>(
          "/api/v1/auth/signin",
          { email, password },
        );
        localStorage.setItem("token", signinRes.data.token);
        router.push("/dashboard");
      } catch {
        router.push("/signin");
      }
    } catch (err: unknown) {
      setError(
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Create an account"
      title="Start drawing together."
      subtitle="Set up your workspace in a few seconds."
      bottomPrompt="Already have an account?"
      bottomLinkText="Sign in"
      bottomLinkHref="/signin"
    >
      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-slate-700">
            Name
          </Label>
          <Input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            disabled={loading}
            autoFocus
            className="h-11 rounded-lg border-slate-300 bg-white focus-visible:ring-slate-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-slate-700">
            Email
          </Label>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
            className="h-11 rounded-lg border-slate-300 bg-white focus-visible:ring-slate-950"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-slate-700">
            Password
          </Label>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            disabled={loading}
            className="h-11 rounded-lg border-slate-300 bg-white focus-visible:ring-slate-950"
          />
        </div>
        {error && (
          <p
            role="alert"
            aria-live="assertive"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
