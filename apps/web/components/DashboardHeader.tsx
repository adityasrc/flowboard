"use client";

import Link from "next/link";
import { Layers, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const getInitials = (name?: string | null) => {
  if (!name || name.trim() === "") return "U";
  const words = name.trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export function DashboardHeader({ user }: UserProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-5">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-black p-[7px] rounded-lg">
              <Layers className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-slate-950">
              Flowboard
            </span>
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="text-[13px] text-slate-300 font-light hidden sm:inline-block">
              /
            </span>
            <span className="text-[13px] text-slate-500 font-medium hidden sm:inline-block tracking-tight">
              Dashboard
            </span>
          </div>
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

            <DropdownMenuContent
              align="end"
              className="w-56 mt-1.5 border-slate-200/80 shadow-md rounded-xl p-1.5"
            >
              <DropdownMenuLabel className="font-normal py-1.5 px-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8 rounded-lg border border-slate-200/80 shrink-0">
                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-[12px] font-medium rounded-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-[13px] font-medium leading-tight text-slate-950 truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-[11.5px] leading-tight text-slate-500 truncate mt-0.5">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-slate-100 my-1" />

              <DropdownMenuItem
                onSelect={handleLogout}
                className="cursor-pointer text-[13px] text-slate-700 hover:text-red-600 focus:text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors rounded-lg px-2 py-1.5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}