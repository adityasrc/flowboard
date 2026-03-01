"use client";
import { WS_BACKEND } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Pencil, RectangleHorizontalIcon, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

interface CanvasProps {
  roomId: string;
}

export function RoomCanvas({ roomId }: CanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
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

  if (!socket) {
    return <div>Connecting to server.....</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
