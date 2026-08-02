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

export default function Signup() {
  const router = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = nameRef.current?.value.trim();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;

    setError("");

    if (!name || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${HTTP_BACKEND}/api/v1/auth/signup`, {
        name,
        email,
        password,
      });
      router.push("/signin");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Try again.");
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
            Create your account
          </CardTitle>
          <CardDescription className="text-[13px] text-slate-500 font-normal">
            Build together from anywhere.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-5 pb-6 px-6">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px] font-medium text-slate-700">
                Name
              </Label>
              <Input
                ref={nameRef}
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                disabled={loading}
                className="h-10 rounded-lg border-slate-200 text-sm focus-visible:ring-slate-950"
              />
            </div>

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
                autoComplete="new-password"
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
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                Already have an account?{" "}
                <Link href="/signin" className="font-semibold text-slate-950 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}