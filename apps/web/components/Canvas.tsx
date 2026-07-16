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
  Type,
} from "lucide-react";
import { WhiteboardEngine } from "@/draw/WhiteboardEngine";
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
  | "diamond"
  | "text";

export function Canvas({ roomId, socket }: CanvasProps) {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<WhiteboardEngine | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");

  // Handles solid white background export so downloaded PNGs aren't transparent/black
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas to merge white background + drawing
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    // Fill white background
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the actual drawing over the white background
    tempCtx.drawImage(canvas, 0, 0);

    const image = tempCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `flowboard-${roomId}.png`;
    link.click();
  };

  useEffect(() => {
    gameRef.current?.setTool(selectedTool);
  }, [selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High-DPI / Retina display scaling prevents blurry lines on MacBooks and 4K monitors
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      gameRef.current?.existingShapes();
    };

    handleResize(); // Initialize sizes immediately

    const game = new WhiteboardEngine(canvas, roomId, socket);
    game.setTool(selectedTool);
    gameRef.current = game;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      game.destroy();
      gameRef.current = null;
    };
  }, [roomId, socket]);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative select-none touch-none"
      style={{
        backgroundColor: "#ffffff",
        backgroundImage: "radial-gradient(#e5e7eb 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="sm:max-w-md rounded-xl border-slate-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Leave Room?
            </DialogTitle>
            <DialogDescription className="text-[14px] text-slate-500 mt-1.5">
              Are you sure you want to leave? Make sure you have saved your work before exiting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setShowLeaveDialog(false)}
              className="inline-flex items-center justify-center border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900 text-[13px] font-medium h-9 px-4 rounded-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white text-[13px] font-medium h-9 px-4 rounded-md shadow-sm cursor-pointer transition-colors"
            >
              Leave
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <canvas ref={canvasRef} className="bg-transparent block absolute inset-0" />

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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200/80 select-none">
      <div className="flex gap-1 items-center">


        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={18} />}
          title="Pencil Tool (Freehand)"
          aria-label="Select Pencil Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("line")}
          activated={selectedTool === "line"}
          icon={<Minus size={18} />}
          title="Line Tool"
          aria-label="Select Line Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          icon={<MoveUpRight size={18} />}
          title="Arrow Tool"
          aria-label="Select Arrow Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon size={18} />}
          title="Rectangle Tool"
          aria-label="Select Rectangle Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle size={18} />}
          title="Circle Tool"
          aria-label="Select Circle Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("diamond")}
          activated={selectedTool === "diamond"}
          icon={<Diamond size={18} />}
          title="Diamond Tool"
          aria-label="Select Diamond Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("text")}
          activated={selectedTool === "text"}
          icon={<Type size={18} />}
          title="Text Tool"
          aria-label="Select Text Tool"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <IconButton
          onClick={() => setSelectedTool("eraser")}
          activated={selectedTool === "eraser"}
          icon={<Eraser size={18} />}
          title="Eraser Tool"
          aria-label="Select Eraser Tool"
        />

        <IconButton
          onClick={onUndo}
          activated={false}
          icon={<Undo size={18} />}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        />

        <IconButton
          onClick={onRedo}
          activated={false}
          icon={<Redo size={18} />}
          title="Redo (Ctrl+Y)"
          aria-label="Redo last action"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />


        <IconButton
          onClick={onDownload}
          activated={false}
          icon={<Download size={18} />}
          title="Download Canvas as PNG"
          aria-label="Download Canvas"
        />

        <IconButton
          onClick={onLeave}
          activated={false}
          icon={<X size={18} />}
          title="Leave Workspace"
          aria-label="Leave Room"
        />
      </div>
    </div>
  );
}