"use client"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Signup() {


    return <div className="w-screen h-screen flex justify-center items-center">

        <Card className="w-full max-w-sm">
            <CardHeader className="pb-0 text-center">
                <CardTitle className="">Create an account</CardTitle> 
                <CardDescription>Enter you details to start collaborating</CardDescription>
            </CardHeader>

            <CardContent>
                <form className="grid gap-4">


                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" type="text" placeholder="aditya" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" type="text" placeholder="aditya123" />
                    </div>

                    <div className="grid gap-2"> {/* proper spacing ke liye */}
                        <Label htmlFor="email">Email</Label>  {/* htmlfor and id same hone chaiye  */}
                        <Input id="email" type="email" placeholder="adit@gmail.com" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="aditya@123" />
                    </div>



                    {/* <input type="text" placeholder="Name"></input>
                <div></div>
                <input type="text" placeholder="Username"></input>
                <div></div>
                <input type="email" placeholder="me@example.com"></input>
                <div></div>
                <input type="password" placeholder="cutedevil"></input>
                <div></div> */}

                </form>
            </CardContent>

            <CardFooter>
                <Button className="w-full" onClick={() => {

                }}>Signup</Button>
            </CardFooter>
        </Card>

    </div>
}