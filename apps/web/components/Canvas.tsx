"use client";
import { IconButton } from "./IconButton";
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
  Minus,
  MoveUpRight,
  Diamond,
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

export type Tool =
  | "rect"
  | "circle"
  | "pencil"
  | "eraser"
  | "undo"
  | "redo"
  | "line"
  | "arrow"
  | "diamond";

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

    game.setTool(selectedTool);

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
    <div
      className="h-screen w-full overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)", //dark gray
        backgroundSize: "32px 32px",
      }}
    >
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md rounded-xl border-slate-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Leave Room?
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[#666666] mt-1.5">
              Are you sure you want to leave? Make sure you have saved your work
              before exiting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:space-x-3">
            <button
              onClick={() => setShowLeaveDialog(false)}
              className="inline-flex items-center justify-center border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 text-[13px] font-medium h-9 px-4 rounded-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                router.push("/dashboard");
              }}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium h-9 px-4 rounded-md shadow-sm cursor-pointer transition-colors"
            >
              Leave
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="bg-transparent" />
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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white px-2 py-1.5 rounded-xl shadow-md border border-gray-100">
      <div className="flex gap-1 items-center">
        <IconButton
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={18} />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("line");
          }}
          activated={selectedTool === "line"}
          icon={<Minus size={18} />}
        />

        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          icon={<MoveUpRight size={18} />}
        />

        <IconButton
          onClick={() => setSelectedTool("diamond")}
          activated={selectedTool === "diamond"}
          icon={<Diamond size={18} />}
        />
        <IconButton
          onClick={() => {
            setSelectedTool("rect");
          }}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon size={18} />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
          icon={<Circle size={18} />}
        />

        <IconButton
          onClick={() => {
            setSelectedTool("eraser");
          }}
          activated={selectedTool === "eraser"}
          icon={<Eraser size={18} />}
        />

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        <IconButton
          onClick={onUndo}
          activated={false}
          icon={<Undo size={18} />}
        />

        <IconButton
          onClick={onRedo}
          activated={false}
          icon={<Redo size={18} />}
        />

        <div className="w-px h-4 bg-gray-300 mx-1"></div>

        <IconButton
          onClick={onLeave}
          activated={false}
          icon={<X size={18} />}
        />

        <IconButton
          onClick={onDownload}
          activated={false}
          icon={<Download size={18} />}
        />
      </div>
    </div>
  );
}
