"use client";
import { WS_BACKEND } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Pencil, RectangleHorizontalIcon, Circle } from "lucide-react";

interface CanvasProps {
  roomId: string;
}


export function RoomCanvas({ roomId }: CanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  //pointer to the canvas

  useEffect(() => {
    const ws = new WebSocket(
      `${WS_BACKEND}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzcxMDg3Njc5fQ.a7GcfV27qjc67BnUrRL3zPhlDAqZ_iEgFfZm0nbYM7g`,
    );

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
  }, [roomId]);

  if (!socket) {
    return <div>Connecting to server.....</div>;
  }

  return (
    <div>
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
