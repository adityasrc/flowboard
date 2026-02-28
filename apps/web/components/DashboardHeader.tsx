"use client"

import { useState } from "react"
import Link from "next/link"
import { Layers, LogOut, Settings, UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface UserProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

const getInitials = (name?: string | null) => {
  if (!name || name.trim() === "") return "U"
  const words = name.trim().split(" ").filter(Boolean)
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function DashboardHeader({ user }: UserProps) {
  const router = useRouter()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    setShowLogoutDialog(false)
    router.push("/")
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-6">
          
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 md:gap-3">
              <Layers className="h-5 w-5 text-black" strokeWidth={2.5} />
              <div className="flex items-center gap-2">
                <span className="font-bold text-[18px] md:text-[19px] tracking-tight text-black antialiased">
                  Flowboard
                </span>
                <span className="text-[15px] text-slate-300 font-light hidden sm:inline-block">/</span>
                <span className="text-[14px] text-slate-500 font-medium hidden sm:inline-block tracking-tight">
                  Dashboard
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar className="h-8 w-8 cursor-pointer ring-1 ring-slate-200 hover:ring-slate-300 transition-all">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-[13px] font-medium">
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 mt-1 border-slate-200 shadow-sm rounded-xl">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-[14px] font-medium leading-none text-slate-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[12px] leading-none text-[#666666]">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                
                <DropdownMenuItem className="cursor-pointer text-[13px] text-slate-700 hover:text-black focus:bg-slate-50">
                  <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-[13px] text-slate-700 hover:text-black focus:bg-slate-50">
                  <Settings className="mr-2 h-4 w-4 text-slate-500" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-100" />
                
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    setShowLogoutDialog(true)
                  }}
                  className="cursor-pointer text-[13px] text-red-600 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </header>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="rounded-xl border-slate-100 shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight">Log out of Flowboard?</AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] text-[#666666]">
              Are you sure you want to log out? You will need to sign in again to access your workspaces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2 sm:space-x-3">

            <AlertDialogCancel className="text-[13px] font-medium h-9 px-4 cursor-pointer border-slate-200 hover:bg-slate-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium h-9 px-4 rounded-md shadow-sm cursor-pointer"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}