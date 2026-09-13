"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { api, isAxiosError } from "@/lib/api";
import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signin() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/v1/auth/signin", {
        email,
        password,
      });
      localStorage.setItem("token", response.data.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(
        isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Server error or invalid credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Sign in"
      title="Welcome back."
      subtitle="Enter your details to continue to your workspace."
      bottomPrompt="Don't have an account?"
      bottomLinkText="Sign up"
      bottomLinkHref="/signup"
    >
      <form onSubmit={handleSignin} className="mt-8 space-y-5">
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
            autoFocus
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
            placeholder="Enter your password"
            autoComplete="current-password"
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
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
