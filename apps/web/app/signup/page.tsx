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
import { useRef } from "react";
import { HTTP_BACKEND } from "@/config";
import { error } from "console";
import { useRouter } from "next/navigation";

export default function Signup() {
  const route = useRouter();

  const nameRef = useRef<HTMLInputElement>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  async function signup() {
    const name = nameRef.current?.value;
    const username = usernameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const response = await axios.post(`${HTTP_BACKEND}/signup`, {
        name,
        username,
        email,
        password,
      });
    //   alert("You have signed up!");
    //   console.log(response);
      route.push("/signin");
    } catch (e: any) {
      if (e.response) {
        alert("User already exists. Please login instead");
      } else {
        alert("Something went wrong");
      }
    }
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-0 text-center">
          <CardTitle className="">Create an account</CardTitle>
          <CardDescription>
            Enter you details to start collaborating
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input ref={nameRef} id="name" type="text" placeholder="aditya" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                ref={usernameRef}
                id="username"
                type="text"
                placeholder="aditya123"
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                placeholder="aditya@123"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => {
              signup();
            }}
          >
            Signup
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
