"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRef, useState, type FormEvent } from "react";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Layers } from "lucide-react";

export default function Signup() {
  const route = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Changed to a standard form submit handler so pressing 'Enter' key submits smoothly
  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const name = nameRef.current?.value.trim();
    const username = usernameRef.current?.value.trim();
    const email = emailRef.current?.value.trim();
    const password = passwordRef.current?.value;

    setError("");

    if (!name || !username || !email || !password) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${HTTP_BACKEND}/signup`, {
        name,
        username,
        email,
        password,
      });
      route.push("/signin");
    } catch (err: unknown) {
      // Type-safe Axios error handling replaces 'any'
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
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-50 px-4">

      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="bg-black p-1.5 rounded-xl transition-transform group-hover:rotate-6">
          <Layers className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[20px] tracking-tight text-black">
          Flowboard
        </span>
      </Link>

      <Card className="w-full max-w-sm shadow-sm border-slate-200">
        <CardHeader className="pb-0 text-center">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details to start collaborating
          </CardDescription>
        </CardHeader>

        {/* Form wrapper enables Enter key submission and seamless password manager autofill */}
        <form onSubmit={handleSignup}>
          <CardContent>
            <div className="grid gap-4 mt-4"> {/* spacing theek ki */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Aditya"
                  autoComplete="name"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input
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
                {/* proper spacing ke liye */}
                <Label htmlFor="email">Email</Label>
                {/* htmlfor and id same hone chaiye */}
                <Input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="adit@gmail.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
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
              {loading ? "Signing up..." : "Signup"}
            </Button>

            <p className="text-sm text-center text-slate-600">
              Already have an account?{" "}
              <Link href="/signin" className="font-semibold text-black hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}