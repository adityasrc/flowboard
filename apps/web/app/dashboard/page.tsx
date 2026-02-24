"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { HTTP_BACKEND } from "@/config";

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

// Dummy user
const currentUser = { name: "Aditya Prakash", email: "aditya@flowboard.com" };

export default function Dashboard() {
  const [workspaceName, setworkspaceName] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const router = useRouter();
  const [slug, setSlug] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  async function CreateWorkspace() {
    if (!workspaceName.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        `${HTTP_BACKEND}/room`,
        {
          name: workspaceName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Room Created:", response.data);
      setworkspaceName("");
      setIsOpen(false);
      fetchRooms(); // Naya room create hote hi list refresh ho jayegi
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRooms() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${HTTP_BACKEND}/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.rooms);
    } catch (e) {
      console.log("Can't fetch Rooms", e);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      
      <DashboardHeader user={currentUser} />

      <main className="p-6 md:p-10 max-w-350 mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 antialiased">
          My Workspaces
        </h1>
        <p className="text-[14px] text-[#666666] mt-1 antialiased">
          Select a Workspace or create a new one.
        </p>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-10 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              className="max-w-xs h-9 text-[13px] border-slate-200 focus-visible:ring-slate-300 shadow-sm"
              placeholder="Room Id..."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="h-9 px-4 text-[13px] font-medium text-slate-600 border-slate-200 hover:text-black cursor-pointer antialiased shadow-sm"
              onClick={() =>
                router.push(
                  `/canvas/${slug.trim().toLowerCase().replace(/\s+/g, "-")}`
                )
              }
              disabled={!slug.trim()}
            >
              Join Room
            </Button>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="bg-black text-white hover:bg-slate-800 text-[13px] font-medium h-9 px-4 rounded-md shadow-sm cursor-pointer antialiased w-full sm:w-auto">
                + Create New
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-xl border-slate-100 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold tracking-tight">Create Workspace</DialogTitle>
                <DialogDescription className="text-[14px] text-[#666666]">
                  Give your new canvas a name to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-[13px] font-medium text-slate-700">Workspace Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. test-room"
                    value={workspaceName}
                    onChange={(e) => {
                      setworkspaceName(e.target.value);
                    }}
                    className="border-slate-200 focus-visible:ring-slate-300 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <Button
                  className="bg-black text-white hover:bg-slate-800 text-[13px] h-9 px-4 shadow-sm cursor-pointer w-full sm:w-auto"
                  type="button"
                  onClick={() => {
                    CreateWorkspace();
                  }}
                  disabled={isLoading || workspaceName.length < 4}
                >
                  {isLoading ? "Creating..." : "Create Workspace"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <section className="mt-4 max-w-350 mx-auto p-6 md:px-10">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-6 p-20 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-center">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900 antialiased mb-2">
              No workspaces yet
            </h3>
            <p className="text-[14px] text-[#666666] mb-6 max-w-sm mx-auto antialiased">
              You haven't created any Flowboards. Create one above to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {rooms.map((room: any) => (
              <Card 
                key={room.id} 
                className="hover:shadow-md cursor-pointer border-slate-200 shadow-sm transition-all overflow-hidden group"
                onClick={() => {
                  router.push(`/canvas/${room.slug}`);
                }}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-[15px] font-semibold text-slate-900 truncate antialiased">{room.slug}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="aspect-video bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center overflow-hidden relative">
                    
                    <img
                      src="/canvas-preview.png"
                      alt="Canvas Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'; 
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 group-hover:bg-transparent transition-all">
                       <span className="text-slate-400 text-xs font-medium">Preview</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-4 pt-0">
                  <span className="text-[12px] text-[#666666] font-medium antialiased">
                    ID: {room.id}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-[12px] text-slate-600 hover:text-black hover:bg-slate-100 cursor-pointer"
                  >
                    Open Flow
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}