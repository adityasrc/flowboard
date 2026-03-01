"use client";
// import { Card } from "@/components/ui/card";
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
import { useRef, useState } from "react"; // Added useState for loading
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import Link from "next/link"; 
import { Layers } from "lucide-react"; 

export default function Signin() {
  const router = useRouter();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // State for handling button loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 

  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    setError(""); // Reset error on new attempt

    // Minimal client-side validation
    if (!username || !password) {
      setError("Username and password are required"); // UI Error, no alert
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${HTTP_BACKEND}/signin`, {
        username,
        password,
      });
      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      router.push("/dashboard");
      //redirect the user to dashboard baki hai - DONE
    } catch (e: any) {
     
      if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Server error or invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  // Yahan <form> ki jagah <div> kar diya hai taaki auto-refresh na ho
  return (
    <div className="bg-slate-50 text-foreground">
      <div className="w-screen h-screen flex flex-col justify-center items-center">
        
        <Link
          href="/"
          className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity"
        >
          <Layers className="h-6 w-6 text-black" strokeWidth={2.5} />
          <span className="font-bold text-2xl tracking-tight text-black">
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

          <CardContent className="grid gap-4 mt-6">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                className="bg-transparent border-input"
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="aditya123"
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
                type="password"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Agar error aayega toh red color mein yahan dikhega */}
            {error && (
              <div className="w-full p-2 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}
            <Button
              type="button"
              className="w-full cursor-pointer"
              disabled={loading}
              onClick={() => {
                signin();
              }}
            >
              {loading ? "Signing in..." : "Signin"}
            </Button>

            {/* New Link for UX completeness */}
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
        </Card>
      </div>
    </div>
  );
}