"use client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Layers, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import axios from "axios";
import { HTTP_BACKEND } from "@/config";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [workspaceName, setworkspaceName] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  async function CreateWorkspace() {
    if (!workspaceName.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token from localStorage:", token);

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
        },
      );
      console.log("Room Created:", response.data);
      setworkspaceName("");
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
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
    <div className="min-h-screen p-8 bg-background">
      {/* navbar */}
      {/* <nav className="flex justify-between items-center p-4 mb-8 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl transition-all duration-300 group-hover:rotate-6 group-hover:scale-110 shadow-sm">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tighter">Flowboard</span>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-4 py-2 text-slate-600 font-medium rounded-xl border border-transparent hover:border-slate-200 hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-300 group cursor-pointer"
            onClick={() => {
              // localStorage.removeItem("token"); //moved it to dialog
              // router.push("/");
              setShowLogoutDialog(true);
            }}
          >
            <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-slate-200 transition-colors">
              <LogOut size={18} />
            </div>
            <span>Logout</span>
          </Button>

          <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle>Logout?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to log out of your account? You will
                  need to sign in again to access your rooms.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowLogoutDialog(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/");
                  }}
                  className="rounded-xl bg-red-500 hover:bg-red-600 cursor-pointer"
                >
                  Logout
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </nav> */}

      <Header isLoggedIn={true}/>

      <main className="p-10 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight">
          My Workspaces
        </h1>
        <p className="text-muted-foreground mt-2">
          Select a Workspace or create a new one.
        </p>

        <div className="flex justify-between items-center mt-10">
          <div className="flex items-center gap-2">
            <Input
              className="max-w-xs"
              placeholder="Room Id..."
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() =>
                router.push(
                  `/canvas/${slug.trim().toLowerCase().replace(/\s+/g, "-")}`,
                )
              }
            >
              Join Room
            </Button>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              {/* dialogtrigger khud me ek button tag ki trah kaam karta hai, so custom button ke liye aschild use karna padta hai */}
              <Button type="button" className="cursor-pointer font-bold">
                + Create New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
                <DialogDescription>
                  Give you new canvas a name to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className=" grid gap-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="test-room"
                    value={workspaceName}
                    onChange={(e) => {
                      setworkspaceName(e.target.value);
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="cursor-pointer"
                  type="button"
                  onClick={() => {
                    CreateWorkspace();
                  }}
                  disabled={isLoading || workspaceName.length < 4}
                >
                  {" "}
                  {isLoading ? "Creating..." : "Create Workspace"}
                </Button>
                {/* type submit submits the input auto while button just triggers onclick */}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </main>

      <section className="mt-12 max-w-6xl mx-auto p-10">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-10 p-20 border-2 border-dashed border-border rounded-3xl bg-muted/10 text-center">
            <h3 className="text-2xl font-bold tracking-tight mb-2">
              No workspaces yet
            </h3>
            <p className="text-muted-foreground mb-6">
              You haven't created any Flowboards. Create one above to get
              started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room: any) => (
              <Card key={room.id} className="hover:shadow-md cursor-pointer">
                <CardHeader>
                  <CardTitle>{room.slug}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                   
                    <img
                      src="/canvas-preview.png"
                      alt="Canvas Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    ID: {room.id}
                  </span>
                  <Button
                    className="cursor-pointer"
                    onClick={() => {
                      router.push(`/canvas/${room.slug}`);
                    }}
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
