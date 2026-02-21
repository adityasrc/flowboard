"use client";
import { IconButton } from "./IconButton";
import initDraw from "@/draw";
import { useEffect, useRef, useState } from "react";
import { Pencil, Circle, RectangleHorizontalIcon, Eraser } from "lucide-react";
import { Game } from "@/draw/Game";
interface CanvasProps {
  roomId: string;
  socket: WebSocket;
}

export type Tool = "rect" | "circle" | "pencil" | "eraser";

export function Canvas({ roomId, socket }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  //pointer to the canvas

  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    const canvas = canvasRef.current;
    //accessing the canvas element
    if (!canvas) return;
    canvas.width = window.innerWidth; //make canvas dimension  = windwo dimension
    canvas.height = window.innerHeight; // use windows hook to handle resizing of window

    console.log("Canvas Init with:", { roomId, socket });

    if (socket && roomId) {
      const g = new Game(canvas, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [roomId, socket]);

  return (
    <div>
      <canvas ref={canvasRef} />
      <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: 10,
      }}
    >
      <div className="flex gap-t">
        <IconButton
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("rect");
          }}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("eraser");
          }}
          activated={selectedTool === "eraser"}
          icon={<Eraser />}
        />
      </div>
    </div>
  );
}
