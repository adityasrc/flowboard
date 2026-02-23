"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LayoutDashboard, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
        <Link href="/" className="font-bold text-xl tracking-tighter">
          Flowboard
        </Link>

        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer outline-none">
                <Avatar className="h-9 w-9 border border-slate-200">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                    AP
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuLabel className="text-slate-500 font-normal">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem className="cursor-pointer py-2" onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  className="cursor-pointer py-2 text-red-600 focus:text-red-600" 
                  onClick={() => setShowLogoutDialog(true)}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex gap-3">
             <Button variant="ghost" onClick={() => router.push("/signin")}>Sign In</Button>
             <Button className="bg-black text-white hover:bg-slate-800" onClick={() => router.push("/signup")}>Get Started</Button>
          </div>
        )}
      </div>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out? You will need to sign in again to access your dashboard.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end mt-4">
            <Button variant="outline" className="cursor-pointer" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="cursor-pointer"
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/");
                setShowLogoutDialog(false);
              }}
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}