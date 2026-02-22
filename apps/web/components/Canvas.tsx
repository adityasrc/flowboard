"use client";
import { IconButton } from "./IconButton";
import initDraw from "@/draw";
import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Circle,
  RectangleHorizontalIcon,
  Eraser,
  Undo,
  Redo,
  X,
  Download,
} from "lucide-react";
import { Game } from "@/draw/Game";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CanvasProps {
  roomId: string;
  socket: WebSocket;
}

export type Tool = "rect" | "circle" | "pencil" | "eraser" | "undo" | "redo";

export function Canvas({ roomId, socket }: CanvasProps) {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const router = useRouter();

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL("image/png");
    //image/png is default type
    //type is optional
    // it returns a string containing the requested data_url

    const link = document.createElement("a");
    link.href = image;
    link.download = `my-drawing-${roomId}.png`;

    link.click();
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // game instance ko hold karega
  const gameRef = useRef<Game | null>(null);

  //pointer to the canvas

  // const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");

  useEffect(() => {
    gameRef.current?.setTool(selectedTool);
  }, [selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    //accessing the canvas element
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth; //make canvas dimension  = windwo dimension
      canvas.height = window.innerHeight;
      gameRef.current?.existingShapes();
    };
    canvas.width = window.innerWidth; //make canvas dimension  = windwo dimension
    canvas.height = window.innerHeight; // use windows hook to handle resizing of window

    // console.log("Canvas Init with:", { roomId, socket });

    const game = new Game(canvas, roomId, socket);

    game.setTool(selectedTool)

    gameRef.current = game;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy();
      gameRef.current = null;
    };

    // if (socket && roomId) {
    //   const g = new Game(canvas, roomId, socket);
    //   setGame(g);

    //   return () => {
    //     g.destroy();
    //   };
    // }
  }, [roomId, socket]);

  return (
    <div>
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Leave Room?</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave? Make sure you have saved your work
              before exiting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                router.push("/dashboard"); // Redirecting to dashboard
              }}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-all cursor-pointer"
            >
              Leave
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} />
      <Topbar
        setSelectedTool={setSelectedTool}
        selectedTool={selectedTool}
        onUndo={() => gameRef.current?.undo()}
        onRedo={() => gameRef.current?.redo()}
        onLeave={() => setShowLeaveDialog(true)}
        onDownload={handleDownload}
      />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  onUndo,
  onRedo,
  onLeave,
  onDownload,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onLeave: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white px-3 py-2 rounded-2xl shadow-md border border-gray-100">
      <div className="flex gap-2 items-center">
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

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <IconButton onClick={onUndo} activated={false} icon={<Undo />} />

        <IconButton onClick={onRedo} activated={false} icon={<Redo />} />

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <IconButton onClick={onLeave} activated={false} icon={<X />} />

        <IconButton
          onClick={onDownload}
          activated={false}
          icon={<Download size={20} />}
        />
      </div>
    </div>
  );
}
