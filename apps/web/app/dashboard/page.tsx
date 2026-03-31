"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";
import { Loader2, ArrowRight } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Room {
  id: string;
  slug: string;
}

export default function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slug, setSlug] = useState("");
  const [joinError, setJoinError] = useState(""); 
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
  }>({});

  const router = useRouter();

  useEffect(() => {
    // Check auth client side (Standard React SPA approach)
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/signin");
      return;
    }

    setIsAuthenticated(true);

    try {
      // Decode JWT token payload silently (atob is base64 decoder)
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userName = payload.name || payload.username || "";
      setCurrentUser({
        name: userName, 
        email: payload.email || "",
      });
    } catch (e) {
      console.log("Failed to decode token for user data");
    }

    fetchRooms();
  }, [router]);

  const handleJoinBySlug = () => {
    setJoinError(""); 

    // URL styling rules ke hisaab se slug ko sanitize kiya
    const formattedSlug = slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') 
      .replace(/-+/g, '-');        
    
    // Yaha pehle ek REST API (axios) call hoti thi room check karne ke liye.
    // Us se "Double Latency" hoti thi user ko join krne par. Ab hum usko hata diye hain.
    // Hum Optimistic Routing use kar rahe hain: simply assume room exist karta h, 
    // navigate immediately, and let the Canvas WebSocket catch the specific 404 error if it doesn't.
    if (formattedSlug.length >= 4) {
      router.push(`/canvas/${formattedSlug}`);
    } else {
      setJoinError("Room slug must be at least 4 characters.");
    }
  };

  async function handleCreateRoom() {
    if (!roomName.trim()) return;

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      console.log("Room Created:", response.data);
      setRoomName("");
      setIsOpen(false);
      fetchRooms(); 
    } catch (e) {
      console.error("Failed to create room:", e);
    } finally {
      setIsCreating(false);
    }
  }

  async function fetchRooms() {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${HTTP_BACKEND}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.rooms);
    } catch (e) {
      console.log("Can't fetch Rooms", e);
    } finally {
      setIsFetching(false);
    }
  }

  // loader dikhao jab tak auth check chal rha h locally taaki white screen (hydration flash) na ho
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFA] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardHeader user={currentUser} />

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          My Rooms
        </h1>
        <p className="text-[14px] text-[#666666] mt-1 mb-10">
          Select a workspace to start collaborating, or create a new one instantly.
        </p>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                className="max-w-xs h-9 text-[13px] border-slate-200 shadow-sm focus-visible:ring-black"
                placeholder="Enter room slug..."
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setJoinError("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinBySlug()}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 text-[13px] font-medium text-slate-600 border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer"
                onClick={handleJoinBySlug} 
                disabled={!slug.trim()}
              >
                Join
              </Button>
            </div>
            {joinError && (
              <span className="text-xs font-medium text-red-500 ml-1">
                {joinError}
              </span>
            )}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="bg-black text-white hover:bg-slate-800 text-[13px] font-medium h-9 px-4 rounded-md shadow-sm w-full sm:w-auto transition-all cursor-pointer"
              >
                + Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-xl border-slate-100 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  New Workspace
                </DialogTitle>
                <DialogDescription className="text-[14px] text-[#666666]">
                  Give your canvas a custom slug to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Room URL Slug
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. daily-standup"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="border-slate-200 shadow-sm"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  className="bg-black text-white hover:bg-slate-800 text-[13px] h-9 px-4 shadow-sm w-full sm:w-auto flex items-center gap-2 cursor-pointer"
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isCreating || roomName.trim().length < 4}
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <section className="mt-2 max-w-7xl mx-auto px-6 md:px-10 pb-20">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center mt-6 p-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-6 p-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center shadow-sm">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
              No active workspaces
            </h3>
            <p className="text-[14px] text-[#666666] mb-6 max-w-sm mx-auto">
              You haven't created any Flowboards yet. Start sketching by creating your first room.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-black text-white hover:bg-slate-800 text-[13px] h-9 px-6 rounded-md shadow-sm cursor-pointer"
            >
              Initialize a canvas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-lg cursor-pointer border-slate-200 shadow-sm transition-all duration-200 overflow-hidden bg-white group hover:-translate-y-1"
                onClick={() => router.push(`/canvas/${room.slug}`)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[15px] font-semibold text-slate-900 truncate">
                    {room.slug}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 pt-0">
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                    
                    <img 
                      src="/canvas-preview.png" 
                      alt="Preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity z-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    
                    {/* Fallback pattern that looks super clean if no preview image exists */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 z-0">
                      <div className="w-8 h-8 border-2 border-slate-300 rounded-md flex items-center justify-center opacity-40">
                         <div className="w-4 h-0.5 bg-slate-400 rotate-45" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Open Workspace
                      </span>
                    </div>

                  </div>
                </CardContent>

                <CardFooter className="flex justify-end items-center p-4 pt-0 mt-2">
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}