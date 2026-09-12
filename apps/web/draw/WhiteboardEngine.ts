import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";
import { Shape } from "./types";
import { isPointInShape } from "./hitTest";
import {
  renderShapes,
  renderCursors,
  drawArrow,
  TEXT_FONT_FAMILY,
  TEXT_FONT_SIZE,
  TEXT_BASELINE_OFFSET,
  RemoteCursor,
} from "./renderer";
import { getDiamondPoints, getCircleFromBounds } from "./geometry";
import { createShape } from "./shapeFactory";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";

export class WhiteboardEngine {
  // Canvas & Rendering
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rc: RoughCanvas;
  private rafId: number | null = null;

  // Session & Network
  private roomId: string;
  private socket: WebSocket;
  private offlineQueue: string[] = [];

  // Canvas State & History
  private shapes: Shape[] = [];
  private myShapeIds: Set<string> = new Set();
  private myActionHistory: string[] = [];
  private redoStack: Shape[] = [];

  // Drawing Interaction State
  private selectedTool: Tool = "rect";
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private currentSeed = 0;
  private currentPath: [number, number][] = [];
  private lastPencilPoint: [number, number] | null = null;
  private activeTextInput: HTMLInputElement | null = null;
  private isDestroyed = false;

  // Remote Cursors
  private cursors: Map<string, RemoteCursor> = new Map();
  private lastCursorBroadcast = 0;
  private inactivityInterval: ReturnType<typeof setInterval> | null = null;

  // Constants
  private static readonly ERASER_TOLERANCE = 5;
  private static readonly CURSOR_THROTTLE_MS = 35;
  private static readonly CURSOR_UPDATE_INTERVAL_MS = 50;
  private static readonly CURSOR_TIMEOUT_MS = 3000;
  private static readonly CURSOR_SMOOTHING = 0.35;
  private static readonly PENCIL_MIN_DISTANCE = 5;

  private onShapesChange?: (count: number) => void;
  private onInitComplete?: (success: boolean, error?: unknown) => void;
  private onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    onShapesChange?: (count: number) => void,
    onInitComplete?: (success: boolean, error?: unknown) => void,
    onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.rc = rough.canvas(canvas);
    this.roomId = roomId;
    this.socket = socket;
    this.onShapesChange = onShapesChange;
    this.onInitComplete = onInitComplete;
    this.onHistoryChange = onHistoryChange;

    this.init();
    this.initSocketHandlers();
    this.initMouseHandlers();

    window.addEventListener("keydown", this.handleKeyDown);
  }

  // Lifecycle
  async init() {
    try {
      const serverShapes = await getExistingShapes(this.roomId);
      if (this.isDestroyed) return;
      this.mergeShapes(serverShapes);
      this.onInitComplete?.(true);
      this.notifyHistory();
    } catch (err: unknown) {
      if (this.isDestroyed) return;
      console.error("Failed to load initial shapes:", err);
      this.onInitComplete?.(false, err);
    }
  }

  private mergeShapes(serverShapes: Shape[]) {
    let hasNew = false;
    for (const s of serverShapes) {
      if (!this.shapes.some((existing) => existing.id === s.id)) {
        this.shapes.push(s);
        hasNew = true;
      }
    }
    if (hasNew) {
      this.render();
    }
  }

  destroy() {
    this.isDestroyed = true;

    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("blur", this.handleMouseLeave);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange,
    );
    window.removeEventListener("keydown", this.handleKeyDown);

    this.sendCursorLeave();

    this.socket.onmessage = null;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.inactivityInterval !== null) {
      clearInterval(this.inactivityInterval);
      this.inactivityInterval = null;
    }

    if (this.activeTextInput) {
      this.activeTextInput.remove();
      this.activeTextInput = null;
    }
  }

  async updateSocket(socket: WebSocket) {
    this.socket = socket;
    this.initSocketHandlers();
    this.flushQueue();

    try {
      const serverShapes = await getExistingShapes(this.roomId);
      if (this.isDestroyed) return;
      this.mergeShapes(serverShapes);
      this.notifyHistory();
    } catch (err) {
      console.warn("Failed to sync shapes on reconnect:", err);
    }
  }

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave);
    window.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("blur", this.handleMouseLeave);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  }

  private initSocketHandlers() {
    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case "shape": {
            const parsedData =
              typeof message.message === "string"
                ? JSON.parse(message.message)
                : message.message;
            const incomingShape: Shape = parsedData?.shape;

            if (
              incomingShape &&
              !this.shapes.some((s) => s.id === incomingShape.id)
            ) {
              this.shapes.push(incomingShape);
              this.render();
            }
            break;
          }

          case "delete_shape": {
            this.shapes = this.shapes.filter((s) => s.id !== message.id);
            this.myShapeIds.delete(message.id);
            this.myActionHistory = this.myActionHistory.filter(
              (id) => id !== message.id,
            );
            this.redoStack = this.redoStack.filter((s) => s.id !== message.id);
            this.render();
            this.notifyHistory();
            break;
          }

          case "cursor": {
            const userId = String(message.userId);
            const existingCursor = this.cursors.get(userId);
            this.cursors.set(userId, {
              x: existingCursor?.x ?? message.x,
              y: existingCursor?.y ?? message.y,
              targetX: message.x,
              targetY: message.y,
              name: message.name || existingCursor?.name || "Collaborator",
              lastSeen: performance.now(),
            });
            this.render();
            this.startCursorLoop();
            break;
          }

          case "cursor_leave": {
            this.cursors.delete(String(message.userId));
            this.render();
            break;
          }
        }
      } catch (err) {
        console.error("Failed to process WebSocket message:", err);
      }
    };
  }

  private startCursorLoop() {
    if (this.inactivityInterval) return;

    this.inactivityInterval = setInterval(() => {
      const now = performance.now();

      this.cursors.forEach((cursor, userId) => {
        if (now - cursor.lastSeen > WhiteboardEngine.CURSOR_TIMEOUT_MS) {
          this.cursors.delete(userId);
          return;
        }

        cursor.x +=
          (cursor.targetX - cursor.x) * WhiteboardEngine.CURSOR_SMOOTHING;
        cursor.y +=
          (cursor.targetY - cursor.y) * WhiteboardEngine.CURSOR_SMOOTHING;
      });

      this.render();

      if (this.cursors.size === 0 && this.inactivityInterval !== null) {
        clearInterval(this.inactivityInterval);
        this.inactivityInterval = null;
      }
    }, WhiteboardEngine.CURSOR_UPDATE_INTERVAL_MS);
  }

  // Public Controls
  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  render() {
    renderShapes(
      this.ctx,
      this.rc,
      this.shapes,
      this.canvas.width,
      this.canvas.height,
    );
    renderCursors(this.ctx, this.cursors);
    this.onShapesChange?.(this.shapes.length);
  }

  canUndo(): boolean {
    return this.myActionHistory.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notifyHistory() {
    this.onHistoryChange?.(this.canUndo(), this.canRedo());
  }

  undo() {
    while (this.myActionHistory.length > 0) {
      const targetId = this.myActionHistory.pop()!;
      const index = this.shapes.findIndex((s) => s.id === targetId);
      if (index !== -1) {
        const [removed] = this.shapes.splice(index, 1);
        this.myShapeIds.delete(removed.id);
        this.redoStack.push(removed);
        this.render();
        this.sendDeleteShape(removed.id);
        this.notifyHistory();
        return;
      }
    }
  }

  redo() {
    if (this.redoStack.length === 0) return;

    // Restore shape to top of canvas
    const restoredShape = this.redoStack.pop()!;
    this.shapes.push(restoredShape);
    this.myShapeIds.add(restoredShape.id);
    this.myActionHistory.push(restoredShape.id);
    this.render();
    this.sendShape(restoredShape);
    this.notifyHistory();
  }

  flushQueue() {
    while (
      this.offlineQueue.length > 0 &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      const message = this.offlineQueue.shift();
      if (message) {
        this.socket.send(message);
      }
    }
  }

  // Event Handlers
  private handleKeyDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    if (
      activeEl === this.activeTextInput ||
      activeEl?.tagName === "INPUT" ||
      activeEl?.tagName === "TEXTAREA"
    ) {
      return;
    }

    const isModifier = e.ctrlKey || e.metaKey;
    if (isModifier && !e.shiftKey && e.key.toLowerCase() === "z") {
      e.preventDefault();
      this.undo();
    } else if (
      (isModifier && e.key.toLowerCase() === "y") ||
      (isModifier && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();
      this.redo();
    }
  };

  private handleMouseDown = (e: MouseEvent) => {
    const { x, y } = this.getCoordinates(e);
    this.isDrawing = true;
    this.startX = x;
    this.startY = y;
    this.currentSeed = rough.newSeed();

    if (this.selectedTool === "pencil") {
      this.currentPath = [[x, y]];
      this.lastPencilPoint = [x, y];
    } else if (this.selectedTool === "eraser") {
      this.eraseAt(x, y);
    } else if (this.selectedTool === "text") {
      this.isDrawing = false;
      this.startTextInput();
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getCoordinates(e);

    this.broadcastCursor(x, y);

    if (this.selectedTool === "eraser") {
      if (this.isDrawing) {
        this.eraseAt(x, y);
      }
      return;
    }

    if (!this.isDrawing) {
      return;
    }

    if (this.selectedTool === "pencil") {
      const lp = this.lastPencilPoint;
      const dist = lp ? Math.hypot(x - lp[0], y - lp[1]) : Infinity;
      if (dist >= WhiteboardEngine.PENCIL_MIN_DISTANCE) {
        this.currentPath.push([x, y]);
        this.lastPencilPoint = [x, y];
      }
    }

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.render();
      this.drawPreview(x, y);
    });
  };

  private handleMouseLeave = () => {
    this.sendCursorLeave();
  };

  private handleVisibilityChange = () => {
    if (document.visibilityState !== "visible") {
      this.sendCursorLeave();
    }
  };

  private handleMouseUp = (e: MouseEvent) => {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const { x, y } = this.getCoordinates(e);
    const shape = createShape(
      this.selectedTool,
      this.startX,
      this.startY,
      x,
      y,
      this.currentSeed,
      this.currentPath,
    );

    if (shape) {
      this.addShape(shape);
    }

    this.currentPath = [];
    this.lastPencilPoint = null;
  };

  // Tool Helpers
  private eraseAt(x: number, y: number) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      if (isPointInShape(x, y, shape, WhiteboardEngine.ERASER_TOLERANCE)) {
        this.shapes.splice(i, 1);
        this.myShapeIds.delete(shape.id);
        this.myActionHistory = this.myActionHistory.filter(
          (id) => id !== shape.id,
        );
        this.render();
        this.sendDeleteShape(shape.id);
        this.notifyHistory();
        return;
      }
    }
  }

  private startTextInput() {
    if (this.activeTextInput) {
      this.activeTextInput.blur();
    }

    const spawnX = this.startX;
    const spawnY = this.startY;

    const rect = this.canvas.getBoundingClientRect();
    const inputLeft = rect.left + spawnX;
    const inputTop = rect.top + spawnY + TEXT_BASELINE_OFFSET;

    const input = document.createElement("input");
    this.activeTextInput = input;
    input.type = "text";
    input.maxLength = 500;

    Object.assign(input.style, {
      position: "fixed",
      left: `${inputLeft}px`,
      top: `${inputTop}px`,
      fontFamily: TEXT_FONT_FAMILY,
      fontSize: `${TEXT_FONT_SIZE}px`,
      lineHeight: "1",
      height: `${TEXT_FONT_SIZE}px`,
      color: "#1f2937",
      background: "transparent",
      border: "none",
      outline: "none",
      zIndex: "1000",
      padding: "0",
      margin: "0",
      minWidth: "20px",
    });

    const adjustWidth = () => {
      input.style.width = "auto";
      input.style.width = `${Math.max(input.scrollWidth + 2, 20)}px`;
    };
    input.addEventListener("input", adjustWidth);
    adjustWidth();

    document.body.appendChild(input);
    setTimeout(() => input.focus(), 0);

    let isCommitted = false;

    const cleanupInput = () => {
      input.remove();
      if (this.activeTextInput === input) {
        this.activeTextInput = null;
      }
    };

    const cancelText = () => {
      if (isCommitted) return;
      isCommitted = true;
      cleanupInput();
    };

    const commitText = () => {
      if (isCommitted) return;
      isCommitted = true;

      const rawText = input.value;
      if (rawText.trim() === "" || this.isDestroyed) {
        cleanupInput();
        return;
      }

      const textShape: Shape = {
        type: "Text",
        text: rawText,
        x: spawnX,
        y: spawnY,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };

      this.addShape(textShape);
      cleanupInput();
    };

    input.addEventListener("blur", () => commitText());
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commitText();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        cancelText();
      }
    });
  }

  private drawPreview(x: number, y: number) {
    const width = x - this.startX;
    const height = y - this.startY;
    const strokeOptions = { stroke: "black", seed: this.currentSeed };

    switch (this.selectedTool) {
      case "rect":
        this.rc.rectangle(
          this.startX,
          this.startY,
          width,
          height,
          strokeOptions,
        );
        break;

      case "circle": {
        const { centerX, centerY, radius } = getCircleFromBounds(
          this.startX,
          this.startY,
          x,
          y,
        );
        this.rc.circle(centerX, centerY, radius * 2, strokeOptions);
        break;
      }

      case "pencil":
        this.rc.linearPath(this.currentPath, strokeOptions);
        break;

      case "line":
        this.rc.line(this.startX, this.startY, x, y, strokeOptions);
        break;

      case "arrow":
        drawArrow(this.rc, this.startX, this.startY, x, y, this.currentSeed);
        break;

      case "diamond": {
        this.rc.polygon(
          getDiamondPoints(this.startX, this.startY, width, height),
          strokeOptions,
        );
        break;
      }
    }
  }

  // Networking & State Helpers
  private addShape(shape: Shape) {
    this.shapes.push(shape);
    this.myShapeIds.add(shape.id);
    this.myActionHistory.push(shape.id);
    this.redoStack = [];
    this.render();
    this.sendShape(shape);
    this.notifyHistory();
  }

  private sendShape(shape: Shape) {
    this.safeSend(
      JSON.stringify({
        type: "shape",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      }),
    );
  }

  private sendDeleteShape(id: string) {
    this.safeSend(
      JSON.stringify({
        type: "delete_shape",
        id,
        roomId: this.roomId,
      }),
    );
  }

  private broadcastCursor(x: number, y: number) {
    const now = performance.now();
    if (now - this.lastCursorBroadcast >= WhiteboardEngine.CURSOR_THROTTLE_MS) {
      this.lastCursorBroadcast = now;
      this.safeSend(
        JSON.stringify({
          type: "cursor",
          roomId: this.roomId,
          x,
          y,
        }),
      );
    }
  }

  private sendCursorLeave() {
    this.safeSend(
      JSON.stringify({ type: "cursor_leave", roomId: this.roomId }),
    );
  }

  private safeSend(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      return;
    }

    try {
      const parsed = JSON.parse(message) as {
        type?: string;
        id?: string;
        message?: string;
      };
      if (parsed.type === "cursor" || parsed.type === "cursor_leave") {
        return;
      }
    } catch {
      // Ignore parse errors; queue the raw message
    }

    this.offlineQueue.push(message);
    if (this.offlineQueue.length > 200) {
      this.offlineQueue.shift();
      console.warn(
        "Offline queue exceeded limit (200). Oldest drawing action was dropped.",
      );
    }
  }

  private getCoordinates(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}
