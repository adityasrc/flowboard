"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HTTP_BACKEND } from "@/config";
import { generateSlug } from "@repo/common";
import { getUserFromToken } from "@/lib/auth";
import {
  Loader2,
  ArrowRight,
  Plus,
  Layers,
  Link as LinkIcon,
  Check,
  Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { CanvasThumbnail } from "@/components/CanvasThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Room {
  id: string;
  slug: string;
}

export default function Dashboard() {
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slug, setSlug] = useState("");
  const [joinError, setJoinError] = useState("");
  const [createError, setCreateError] = useState("");
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
  }>({});

  const router = useRouter();

  const fetchRooms = useCallback(async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${HTTP_BACKEND}/api/v1/canvases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(response.data.rooms || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Failed to fetch canvases:", err.message);
      }
    } finally {
      setIsFetching(false);
    }
  }, []);

  const handleCreateRoom = async () => {
    const formattedSlug = generateSlug(roomName);
    if (!formattedSlug || formattedSlug.length < 4) {
      setCreateError("Canvas name must be at least 4 characters.");
      return;
    }

    setCreateError("");
    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      await axios.post(
        `${HTTP_BACKEND}/api/v1/canvas`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setRoomName("");
      setIsOpen(false);
      fetchRooms();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setCreateError("A canvas with this name already exists.");
      } else {
        setCreateError("Something went wrong. Please try again.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      setRooms((prev) => prev.filter((r) => r.id !== roomId));

      await axios.delete(`${HTTP_BACKEND}/api/v1/canvas/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRoomToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete canvas:", err);
      fetchRooms();
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.search.includes("error=not_found")) {
        setJoinError("Canvas not found. Please check the name.");
        window.history.replaceState(null, "", "/dashboard");
      } else if (window.location.search.includes("error=access_denied")) {
        setJoinError("Access denied to this canvas.");
        window.history.replaceState(null, "", "/dashboard");
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const user = getUserFromToken(token);
    if (!user) {
      localStorage.removeItem("token");
      router.push("/signin");
      return;
    }

    setCurrentUser({
      name: user.name,
      email: user.email,
    });
    setIsAuthenticated(true);
    fetchRooms();
  }, [router, fetchRooms]);

  const handleJoinBySlug = async () => {
    setJoinError("");

    const formattedSlug = generateSlug(slug);

    if (formattedSlug.length < 4) {
      setJoinError("Canvas name must be at least 4 characters.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    setIsJoining(true);
    try {
      await axios.get(`${HTTP_BACKEND}/api/v1/shapes/${formattedSlug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/canvas/${formattedSlug}`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setJoinError("Canvas not found. Please check the name.");
        } else if (err.response?.status === 403) {
          setJoinError("Access denied to this canvas.");
        } else {
          setJoinError("Something went wrong. Please try again.");
        }
      } else {
        setJoinError("Something went wrong. Please try again.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInviteLink = async (e: React.MouseEvent, roomSlug: string) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const inviteUrl = `${origin}/canvas/${roomSlug}`;

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopiedSlug(roomSlug);
        setTimeout(() => {
          setCopiedSlug((current) => (current === roomSlug ? null : current));
        }, 2000);
      } catch (err) {
        console.error("Failed to copy invite link to clipboard:", err);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const generatedPreviewSlug = roomName.trim()
    ? generateSlug(roomName)
    : "your-canvas-name";

  return (
    <div className="min-h-screen bg-slate-50/60 antialiased font-sans text-slate-900">
      <DashboardHeader user={currentUser} />

      <main className="max-w-6xl mx-auto px-5 py-6 sm:py-8">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Canvases
          </h1>
          <p className="text-[13px] text-slate-500">
            Manage your canvases and collaborations.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 mb-6">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                className="w-full sm:w-68 h-9 text-[13px] bg-white border-slate-200 rounded-lg placeholder:text-slate-400 focus-visible:ring-slate-950 shadow-xs"
                placeholder="Enter canvas name..."
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setJoinError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinBySlug()}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3.5 text-[13px] font-medium text-slate-700 bg-white border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shrink-0 shadow-xs"
                onClick={handleJoinBySlug}
                disabled={!slug.trim() || isJoining}
              >
                {isJoining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Join"}
              </Button>
            </div>
            {joinError && (
              <span className="text-xs font-medium text-red-500 pl-0.5">
                {joinError}
              </span>
            )}
          </div>

          <Dialog
            open={isOpen}
            onOpenChange={(open) => {
              setIsOpen(open);
              if (!open) {
                setCreateError("");
                setRoomName("");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                className="h-9 px-3.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[13px] font-medium shadow-xs cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" />
                New Canvas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-xl border-slate-200/80 shadow-md p-6">
              <DialogHeader className="gap-1">
                <DialogTitle className="text-lg font-semibold tracking-tight text-slate-950">
                  New Canvas
                </DialogTitle>
                <DialogDescription className="text-[13px] text-slate-500">
                  Give your canvas a custom name to get started.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-3">
                <div className="grid gap-2">
                  <Label
                    htmlFor="name"
                    className="text-[13px] font-medium text-slate-700"
                  >
                    Canvas Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    autoFocus
                    placeholder="e.g. daily-standup"
                    value={roomName}
                    onChange={(e) => {
                      setRoomName(e.target.value);
                      setCreateError("");
                    }}
                    className="h-9 rounded-lg border-slate-200 text-[13px] focus-visible:ring-slate-950"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                  />

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-0.5">
                    <span>URL Preview:</span>
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11.5px]">
                      /canvas/{generatedPreviewSlug}
                    </code>
                  </div>

                  {createError && (
                    <span className="text-xs font-medium text-red-500">
                      {createError}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 px-3.5 text-[13px] rounded-lg border-slate-200 hover:bg-slate-50"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="h-9 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[13px] font-medium shadow-none flex items-center gap-2 cursor-pointer transition-colors"
                  type="button"
                  onClick={handleCreateRoom}
                  disabled={isCreating || generatedPreviewSlug.length < 4}
                >
                  {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Canvas"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isFetching ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 bg-white overflow-hidden flex flex-col"
              >
                <Skeleton className="h-28 w-full bg-slate-100/80" />
                <div className="p-3.5 space-y-2.5">
                  <Skeleton className="h-4 w-3/4 bg-slate-100" />
                  <Skeleton className="h-3 w-1/2 bg-slate-100" />
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Skeleton className="h-3.5 w-24 bg-slate-100" />
                    <Skeleton className="h-3.5 w-3.5 bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-6 border border-dashed border-slate-200/90 rounded-xl bg-white/80 text-center">
            <div className="w-10 h-10 rounded-lg bg-slate-100/90 border border-slate-200/60 flex items-center justify-center mb-3 shadow-2xs">
              <Layers className="h-5 w-5 text-slate-500" strokeWidth={1.75} />
            </div>
            <h3 className="text-[15px] font-semibold tracking-tight text-slate-950 mb-1">
              No canvases yet
            </h3>
            <p className="text-[13px] text-slate-500 mb-4 max-w-xs">
              Create your first canvas to start diagramming and collaborating in real-time.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              className="h-9 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[13px] font-medium shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Canvas
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/canvas/${room.slug}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 cursor-pointer"
              >
                <div className="rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
                  <div className="h-28 border-b border-slate-100 relative flex items-center justify-center overflow-hidden">
                    <CanvasThumbnail slug={room.slug} />

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRoomToDelete(room);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-white/90 border border-transparent hover:border-slate-200/80 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                      title="Delete Canvas"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-slate-950 group-hover:text-black truncate tracking-tight">
                        {room.slug}
                      </h3>
                      <p className="text-[11.5px] text-slate-400 font-mono mt-0.5 truncate group-hover:text-slate-600 transition-colors">
                        /canvas/{room.slug}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[12px]">
                      <button
                        type="button"
                        onClick={(e) => handleCopyInviteLink(e, room.slug)}
                        className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-normal py-1 px-2 -ml-2 rounded-md hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        {copiedSlug === room.slug ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-600 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Copy invite link</span>
                          </>
                        )}
                      </button>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!roomToDelete}
        onOpenChange={(open) => !open && setRoomToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-md rounded-xl border-slate-200/80 shadow-md p-6">
          <AlertDialogHeader className="gap-1">
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-slate-950">
              Delete canvas?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800 font-mono">
                /canvas/{roomToDelete?.slug}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-3">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-9 px-3.5 text-[13px] rounded-lg border-slate-200 hover:bg-slate-50"
              onClick={() => setRoomToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (roomToDelete) handleDeleteRoom(roomToDelete.id);
              }}
              className="h-9 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium shadow-none cursor-pointer transition-colors"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              {isDeleting ? "Deleting..." : "Delete Canvas"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}