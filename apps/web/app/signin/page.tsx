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
import { useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";

export default function Signin() {
  const router = useRouter();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function signin() {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const response = await axios.post(`${HTTP_BACKEND}/signin`, {
        username,
        password,
      });
      const jwt = response.data.token;
      localStorage.setItem("token", jwt);
      router.push("/dashboard");
      //redirect the user to dashboard baki hai
    } catch (e: any) {
      if (e.response) {
        alert(e.response.data.message);
      } else {
        alert("Server error");
      }
    }
  }

  // Yahan <form> ki jagah <div> kar diya hai taaki auto-refresh na ho
  return (
    <div className="bg-background text-foreground">
      <div className="w-screen h-screen flex justify-center items-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center pb-0">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your details to continue collaborating
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input className="bg-transparent border-input"
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="aditya123"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input className="bg-transparent border-input"
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="aditya@123"
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              className="w-full cursor-pointer"
              onClick={() => {
                signin();
              }}
            >
              Signin
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
