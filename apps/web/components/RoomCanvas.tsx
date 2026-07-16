"use client";

import { WS_BACKEND } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "@/components/Canvas";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CanvasProps {
  roomId: string;
}

export function RoomCanvas({ roomId }: CanvasProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loadingText, setLoadingText] = useState("Connecting to server...");
  const router = useRouter();

  // Holds the active WebSocket so the cleanup function always closes the
  // most recently created socket, even after reconnect cycles.
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    // Show a hint after 3s that the cloud server may be cold-starting.
    const coldStartTimer = setTimeout(() => {
      setLoadingText(
        "Waking up the cloud server — this can take up to 50s on first load…",
      );
    }, 3000);

    function connect() {
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

      // Pass the JWT as the Sec-WebSocket-Protocol sub-protocol instead of a
      // URL query param. URL params are recorded verbatim in proxy access logs;
      // the protocol header is not.
      const ws = new WebSocket(WS_BACKEND, token);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) {
          ws.close();
          return;
        }

        // CRITICAL FIX: Kill the cold-start hint immediately once connected
        clearTimeout(coldStartTimer);

        attempts = 0; // reset backoff on successful connection
        setSocket(ws);
        setLoadingText("Connecting to server...");
        ws.send(JSON.stringify({ type: "join_room", roomId }));
      };

      ws.onclose = (event) => {
        if (cancelled) return;
        setSocket(null);

        // Standard WS auth violation codes (1008 = Policy Violation, 4001/4003 = Custom Auth Fail)
        // If the token is rejected by backend, do not retry 5 times; logout immediately.
        if (event.code === 1008 || event.code === 4001 || event.code === 4003) {
          try {
            localStorage.removeItem("token");
          } catch (e) { }
          router.push("/signin");
          return;
        }

        if (attempts < MAX_ATTEMPTS) {
          // Exponential backoff: 1s, 2s, 4s, 8s, 16s (capped at 30s)
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

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearTimeout(coldStartTimer);
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

  // Directly returning Canvas keeps the React DOM tree clean and avoids nested wrappers
  return <Canvas roomId={roomId} socket={socket} />;
}