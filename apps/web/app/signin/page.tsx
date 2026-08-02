"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef, useState, type FormEvent } from "react";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers, Loader2 } from "lucide-react";

export default function Signin() {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${HTTP_BACKEND}/api/v1/auth/signin`, {
        email,
        password,
      });

      const jwt = response.data.token;

      try {
        localStorage.setItem("token", jwt);
      } catch {
        // Storage unavailable
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Server error or invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] text-slate-900 selection:bg-slate-200 antialiased font-sans flex flex-col justify-center items-center px-4 pb-8">
      <div className="flex flex-col items-center mb-4.5 text-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-black p-[7px] rounded-lg">
            <Layers className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-slate-950">
            Flowboard
          </span>
        </Link>
      </div>

      <Card className="w-full max-w-[380px] rounded-xl border border-slate-200/80 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <CardHeader className="text-center pt-6 pb-0 px-6 flex flex-col gap-1 items-center">
          <CardTitle className="text-xl font-semibold tracking-tight text-slate-950">
            Welcome back
          </CardTitle>
          <CardDescription className="text-[13px] text-slate-500 font-normal">
            Sign in to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 pb-6 px-6">
          <form onSubmit={handleSignin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-slate-700">
                Email
              </Label>
              <Input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                placeholder="me@example.com"
                autoComplete="email"
                disabled={loading}
                className="h-10 rounded-lg border-slate-200 text-sm focus-visible:ring-slate-950"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-slate-700">
                Password
              </Label>
              <Input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="h-10 rounded-lg border-slate-200 text-sm focus-visible:ring-slate-950"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50/80 border border-red-200/80 rounded-lg text-center">
                <p className="text-xs font-medium text-red-600">{error}</p>
              </div>
            )}

            <div className="pt-1.5 space-y-3">
              <Button
                type="submit"
                className="w-full h-10 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-sm font-medium gap-2 transition-colors duration-150"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-slate-950 hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}