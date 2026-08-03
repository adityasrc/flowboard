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
  LogOut,
  Download,
  Minus,
  MoveUpRight,
  Diamond,
  Type,
} from "lucide-react";
import { WhiteboardEngine } from "@/draw/WhiteboardEngine";
import { useRouter } from "next/navigation";

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

interface CanvasProps {
  roomId: string;
  socket: WebSocket;
  onEngineReady?: (engine: WhiteboardEngine) => void;
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

export function Canvas({ roomId, socket, onEngineReady }: CanvasProps) {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [shapeCount, setShapeCount] = useState(0);
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<WhiteboardEngine | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
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

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);

      gameRef.current?.render();
    };

    handleResize();

    const game = new WhiteboardEngine(canvas, roomId, socket, (count) => {
      setShapeCount(count);
    });
    game.setTool(selectedTool);
    gameRef.current = game;
    onEngineReady?.(game);

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
      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent className="sm:max-w-md rounded-xl border-slate-200/80 shadow-md p-6">
          <AlertDialogHeader className="gap-1 text-left">
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-slate-950">
              Leave canvas?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-3">
            <AlertDialogCancel
              className="h-9 px-3.5 text-[13px] rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
              onClick={() => setShowLeaveDialog(false)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-9 px-4 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[13px] font-medium shadow-none cursor-pointer transition-colors"
              onClick={() => router.push("/dashboard")}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <canvas ref={canvasRef} className="bg-transparent block absolute inset-0" />

      {shapeCount === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-slate-300 font-medium flex flex-col items-center gap-1 select-none z-0">
          <p>Start drawing...</p>
          <p className="text-sm font-normal">Use the toolbar above to sketch</p>
        </div>
      )}

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
  const ICON_SIZE = 18;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md px-1.5 py-1.5 rounded-xl shadow-md border border-slate-200/80 select-none">
      <div className="flex gap-1 items-center">
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={ICON_SIZE} />}
          title="Pencil Tool (Freehand)"
          aria-label="Select Pencil Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("line")}
          activated={selectedTool === "line"}
          icon={<Minus size={ICON_SIZE} />}
          title="Line Tool"
          aria-label="Select Line Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          icon={<MoveUpRight size={ICON_SIZE} />}
          title="Arrow Tool"
          aria-label="Select Arrow Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon size={ICON_SIZE} />}
          title="Rectangle Tool"
          aria-label="Select Rectangle Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle size={ICON_SIZE} />}
          title="Circle Tool"
          aria-label="Select Circle Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("diamond")}
          activated={selectedTool === "diamond"}
          icon={<Diamond size={ICON_SIZE} />}
          title="Diamond Tool"
          aria-label="Select Diamond Tool"
        />

        <IconButton
          onClick={() => setSelectedTool("text")}
          activated={selectedTool === "text"}
          icon={<Type size={ICON_SIZE} />}
          title="Text Tool"
          aria-label="Select Text Tool"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <IconButton
          onClick={() => setSelectedTool("eraser")}
          activated={selectedTool === "eraser"}
          icon={<Eraser size={ICON_SIZE} />}
          title="Eraser Tool"
          aria-label="Select Eraser Tool"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <IconButton
          onClick={onUndo}
          activated={false}
          icon={<Undo size={ICON_SIZE} />}
          title="Undo (Ctrl+Z)"
          aria-label="Undo last action"
        />

        <IconButton
          onClick={onRedo}
          activated={false}
          icon={<Redo size={ICON_SIZE} />}
          title="Redo (Ctrl+Y)"
          aria-label="Redo last action"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />

        <IconButton
          onClick={onDownload}
          activated={false}
          icon={<Download size={ICON_SIZE} />}
          title="Download Canvas as PNG"
          aria-label="Download Canvas"
        />

        <IconButton
          onClick={onLeave}
          activated={false}
          icon={<LogOut size={ICON_SIZE} />}
          title="Leave Room"
          aria-label="Leave Room"
        />
      </div>
    </div>
  );
}