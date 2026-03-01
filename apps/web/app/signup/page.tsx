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
import { useRef, useState } from "react";
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

  async function signup() {
    const name = nameRef.current?.value;
    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
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
      const response = await axios.post(`${HTTP_BACKEND}/signup`, {
        name,
        username,
        email,
        password,
      });
      route.push("/signin");
    } catch (e: any) {
      
      if (e.response?.data?.message) {
        setError(e.response.data.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-50">
      
      <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
        <Layers className="h-6 w-6 text-black" strokeWidth={2.5} />
        <span className="font-bold text-2xl tracking-tight text-black">
          Flowboard
        </span>
      </Link>

      <Card className="w-full max-w-sm shadow-sm border-slate-200">
        <CardHeader className="pb-0 text-center">
          <CardTitle className="">Create an account</CardTitle>
          <CardDescription>
            Enter you details to start collaborating
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 mt-4"> {/* spacing theek ki */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input ref={nameRef} id="name" type="text" placeholder="aditya" disabled={loading} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="aditya123"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              {" "}
              {/* proper spacing ke liye */}
              <Label htmlFor="email">Email</Label>{" "}
              {/* htmlfor and id same hone chaiye  */}
              <Input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="adit@gmail.com"
                disabled={loading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="aditya@123"
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
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
              signup();
            }}
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
      </Card>
    </div>
  );
}