"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import Link from "next/link";
import { Layers } from "lucide-react";

export default function Signin() {
  const router = useRouter();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // <form onSubmit={...}> aur e.preventDefault() use karne se page refresh nahi hota 
  // aur keyboard ka 'Enter' button smooth login trigger करता hai
  async function handleSignin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const username = usernameRef.current?.value.trim();
    const password = passwordRef.current?.value;

    setError(""); // Reset error on new attempt

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${HTTP_BACKEND}/signin`, {
        username,
        password,
      });

      const jwt = response.data.token;

      // Safari Incognito ya restrictive iframes me localStorage fail na ho isliye try/catch
      try {
        localStorage.setItem("token", jwt);
      } catch (storageErr) {
        console.warn("Could not save token to storage:", storageErr);
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
    <div className="bg-slate-50 text-foreground">
      <div className="w-screen h-screen flex flex-col justify-center items-center px-4">

        <Link
          href="/"
          className="flex items-center gap-2.5 mb-8 group"
        >
          <div className="bg-black p-1.5 rounded-xl transition-transform group-hover:rotate-6">
            <Layers className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[20px] tracking-tight text-black">
            Flowboard
          </span>
        </Link>

        <Card className="w-full max-w-sm shadow-sm border-slate-200">
          <CardHeader className="text-center pb-0">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              Enter your details to continue collaborating
            </CardDescription>
          </CardHeader>

          {/* Form wrapper enables instant Enter-key submit and browser autofill support */}
          <form onSubmit={handleSignin}>
            <CardContent className="grid gap-4 mt-6">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  className="bg-transparent border-input"
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="aditya123"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  className="bg-transparent border-input"
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-2">
              {error && (
                <div className="w-full p-2 bg-red-50 border border-red-200 rounded-md text-center">
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full cursor-pointer bg-black text-white hover:bg-slate-800"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Signin"}
              </Button>

              <p className="text-sm text-center text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-black hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}