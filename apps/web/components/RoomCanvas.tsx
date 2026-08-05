"use client";

import { WS_BACKEND } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { WhiteboardEngine } from "@/draw/WhiteboardEngine";

interface CanvasProps {
  roomId: string;
}

export function RoomCanvas({ roomId }: CanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingText, setLoadingText] = useState("Connecting to server...");
  const router = useRouter();

  const wsRef = useRef<WebSocket | null>(null);
  const engineRef = useRef<WhiteboardEngine | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let isReconnecting = false;
    const MAX_ATTEMPTS = 5;

    const coldStartTimer = setTimeout(() => {
      setLoadingText(
        "Waking up the cloud server — this can take up to 50s on first load…",
      );
    }, 3000);

    function connect() {
      if (isReconnecting) return;

      let token = "";
      try {
        token = localStorage.getItem("token") || "";
      } catch (err) {
        console.warn("Storage access blocked:", err);
      }

      if (!token || token === "undefined" || token === "null" || token === "") {
        router.push("/signin");
        return;
      }

      if (wsRef.current) {
        try { wsRef.current.close(); } catch {}
        wsRef.current = null;
      }

      isReconnecting = true;
      const ws = new WebSocket(WS_BACKEND, token);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) {
          ws.close();
          return;
        }

        isReconnecting = false;
        clearTimeout(coldStartTimer);
        attempts = 0;
        setLoadingText("Connecting to server...");
        ws.send(JSON.stringify({ type: "join_room", roomId }));

        if (engineRef.current) {
          // Reconnect: update the existing engine's socket and flush the queue.
          // Canvas stays mounted, engine stays alive, no data loss.
          setIsConnected(true);
          engineRef.current.updateSocket(ws);
        } else {
          // First connect: mount Canvas for the first time.
          setSocket(ws);
          setIsConnected(true);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        if (cancelled || wsRef.current !== ws) return;
        isReconnecting = false;
        wsRef.current = null;
        setIsConnected(false);

        if (event.code === 1008 || event.code === 4001 || event.code === 4003) {
          try {
            localStorage.removeItem("token");
          } catch (e) {}
          router.push("/signin");
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          const delay = Math.min(1000 * Math.pow(2, attempts), 30_000);
          attempts++;
          setLoadingText(
            `Connection lost. Reconnecting in ${Math.round(delay / 1000)}s… (attempt ${attempts}/${MAX_ATTEMPTS})`,
          );
          reconnectTimer = setTimeout(connect, delay);
        } else {
          setLoadingText("Could not reconnect. Please refresh the page.");
        }
      };
    }

    const handleOnline = () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      attempts = 0;
      setLoadingText("Reconnecting to server...");
      connect();
    };

    const handleOffline = () => {
      setIsConnected(false);
      setLoadingText("Connection lost. Drawings will sync when reconnected.");
      try { wsRef.current?.close(); } catch {}
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearTimeout(coldStartTimer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      wsRef.current?.close();
    };
  }, [roomId, router]);

  if (!socket) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-50 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        <p className="text-[14px] font-medium text-slate-600 animate-pulse text-center px-4 max-w-md">
          {loadingText}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Canvas
        roomId={roomId}
        socket={socket}
        onEngineReady={(engine) => {
          engineRef.current = engine;
        }}
      />
      {!isConnected && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-slate-900/90 text-white text-[12px] font-medium px-4 py-2 rounded-full shadow-lg backdrop-blur-sm pointer-events-none border border-slate-700/50">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>{loadingText}</span>
        </div>
      )}
    </div>
  );
}