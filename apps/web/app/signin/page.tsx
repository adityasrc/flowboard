"use client"
// import { Card } from "@/components/ui/card";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signin() {
    return (
        <form className="w-screen h-screen flex justify-center items-center">
            
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center pb-0">
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Enter your details to continue collaborating</CardDescription>
                </CardHeader>

                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="username" >Username</Label>
                        <Input id="username" type="text" placeholder="aditya123"/>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="aditya@123"/>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button className="w-full" onClick={()=>{

                    }}>Signin</Button>
                </CardFooter>

            </Card>




            {/* <div>
                <input type="text" placeholder="Name"></input>
                <div></div>
                <input type="password" placeholder="adc@123"></input>
                <div></div>
                <button onClick={() => {

                }}>Signin</button>
            </div> */}

        </form>
    )
}