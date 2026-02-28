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

  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
  }>({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    
    if (!token) {
      router.push("/signin");
      return;
    }

    setIsAuthenticated(true);


    try {
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

  
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <DashboardHeader user={currentUser} />

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          My Rooms
        </h1>
        <p className="text-[14px] text-[#666666] mt-1">
          Select a room to start collaborating, or create a new one.
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 gap-4">
        
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              className="max-w-xs h-9 text-[13px] border-slate-200 shadow-sm"
              placeholder="Room slug..."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-[13px] font-medium text-slate-600 border-slate-200 shadow-sm"
              onClick={() => {
                const formattedSlug = slug
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, "-");
               
                router.push(`/canvas/${formattedSlug}`);
              }}
              disabled={!slug.trim()}
            >
              Join Room
            </Button>
          </div>

          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                className="bg-black text-white hover:bg-slate-800 text-[13px] font-medium h-9 px-4 rounded-md shadow-sm w-full sm:w-auto"
              >
                + Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-xl border-slate-100 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold tracking-tight">
                  Create Room
                </DialogTitle>
                <DialogDescription className="text-[14px] text-[#666666]">
                  Give your new room a name to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Room Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. daily-standup"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="border-slate-200 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  className="bg-black text-white hover:bg-slate-800 text-[13px] h-9 px-4 shadow-sm w-full sm:w-auto flex items-center gap-2"
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

      <section className="mt-4 max-w-7xl mx-auto p-6 md:px-10">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center mt-6 p-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : rooms.length === 0 ? (

          <div className="flex flex-col items-center justify-center mt-6 p-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-center shadow-sm">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 mb-2">
              No rooms yet
            </h3>
            <p className="text-[14px] text-[#666666] mb-6 max-w-sm mx-auto">
              You haven't created any Flowboards. Start collaborating by
              creating your first room.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-black text-white hover:bg-slate-800 text-[13px] h-9 px-6 rounded-md shadow-sm"
            >
              Create your first room
            </Button>
          </div>
        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className="hover:shadow-md cursor-pointer border-slate-200 shadow-sm transition-all overflow-hidden bg-white group"
                onClick={() => router.push(`/canvas/${room.slug}`)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[15px] font-semibold text-slate-900 truncate">
                    {room.slug}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src="/canvas-preview.png"
                      alt="Canvas Preview"
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
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
