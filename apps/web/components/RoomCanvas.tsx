"use client";
import { WS_BACKEND } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Pencil, RectangleHorizontalIcon, Circle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CanvasProps {
  roomId: string;
}

export function RoomCanvas({ roomId }: CanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loadingText, setLoadingText] = useState("Connecting to server...");
  //pointer to the canvas
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null" || token === ""){
      router.push('/signin');
      return;
    }

    const ws = new WebSocket(`${WS_BACKEND}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        }),
      );
    };

    return () => {
      ws.close();
    };
  }, [roomId, router]);

  // User ko wait karana padega jab tak websocket connect na ho, beautiful loader dikhate hai
  useEffect(() => {
    // 3 sec baad msg change karenge taaki user ko lage app hang nahi hua hai
    const timer1 = setTimeout(() => setLoadingText("Waking up the cloud server (this takes ~50s)..."), 3000);
    // 20 sec baad aur msg change karenge 
    const timer2 = setTimeout(() => setLoadingText("Booting up real-time engine..."), 20000);
    
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  if (!socket) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#FAFAFA] gap-4">
        {/* lucide-react ka spinner */}
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        <p className="text-[14px] font-medium text-slate-600 animate-pulse">
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
