import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";
import { Shape } from "./types";
import { isPointInShape } from "./hitTest";
import {
  renderShapes,
  renderCursors,
  drawArrow,
  TEXT_FONT,
  TEXT_FONT_FAMILY,
  TEXT_FONT_SIZE,
  RemoteCursor,
} from "./renderer";
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

  // Remote Cursors
  private cursors: Map<string, RemoteCursor> = new Map();
  private lastCursorBroadcast = 0;
  private inactivityInterval: ReturnType<typeof setInterval> | null = null;

  // Constants
  private static readonly ERASER_TOLERANCE = 5;
  private static readonly CURSOR_THROTTLE_MS = 35;
  private static readonly CURSOR_INACTIVITY_INTERVAL_MS = 1000;
  private static readonly PENCIL_MIN_DISTANCE = 5;

  private onShapesChange?: (count: number) => void;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket,
    onShapesChange?: (count: number) => void,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.rc = rough.canvas(canvas);
    this.roomId = roomId;
    this.socket = socket;
    this.onShapesChange = onShapesChange;

    this.init();
    this.initSocketHandlers();
    this.initMouseHandlers();

    window.addEventListener("keydown", this.handleKeyDown);
  }

  // Lifecycle
  async init() {
    this.shapes = await getExistingShapes(this.roomId);
    this.render();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
    window.removeEventListener("keydown", this.handleKeyDown);

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

  initHandlers() {
    this.initSocketHandlers();
  }

  initMouseHandler() {
    this.initMouseHandlers();
  }

  private initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown);
    this.canvas.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);
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

            if (incomingShape && !this.shapes.some((s) => s.id === incomingShape.id)) {
              this.shapes.push(incomingShape);
              this.render();
            }
            break;
          }

          case "delete_shape": {
            this.shapes = this.shapes.filter((s) => s.id !== message.id);
            this.render();
            break;
          }

          case "cursor": {
            this.cursors.set(String(message.userId), {
              x: message.x,
              y: message.y,
              lastSeen: performance.now(),
            });
            this.render();

            if (!this.inactivityInterval) {
              this.inactivityInterval = setInterval(() => {
                if (this.cursors.size === 0) {
                  if (this.inactivityInterval !== null) {
                    clearInterval(this.inactivityInterval);
                    this.inactivityInterval = null;
                  }
                  return;
                }
                this.render();
              }, WhiteboardEngine.CURSOR_INACTIVITY_INTERVAL_MS);
            }
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

  // Public Controls
  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  render() {
    renderShapes(this.ctx, this.rc, this.shapes, this.canvas.width, this.canvas.height);
    renderCursors(this.ctx, this.cursors);
    this.onShapesChange?.(this.shapes.length);
  }

  getShapesCount(): number {
    return this.shapes.length;
  }

  undo() {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const targetShape = this.shapes[i];
      if (this.myShapeIds.has(targetShape.id)) {
        const [removed] = this.shapes.splice(i, 1);
        this.myShapeIds.delete(removed.id);
        this.redoStack.push(removed);
        this.render();
        this.sendDeleteShape(removed.id);
        return;
      }
    }
  }

  redo() {
    if (this.redoStack.length === 0) return;

    const restoredShape = this.redoStack.pop()!;
    this.shapes.push(restoredShape);
    this.myShapeIds.add(restoredShape.id);
    this.render();
    this.sendShape(restoredShape);
  }

  flushQueue() {
    while (this.offlineQueue.length > 0 && this.socket.readyState === WebSocket.OPEN) {
      const message = this.offlineQueue.shift();
      if (message) {
        this.socket.send(message);
      }
    }
  }

  // Event Handlers
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "z") {
      e.preventDefault();
      this.undo();
    } else if (e.ctrlKey && e.key === "y") {
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
      this.startTextInput(e);
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getCoordinates(e);

    this.broadcastCursor(x, y);

    if (!this.isDrawing || this.selectedTool === "eraser") {
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

  // Backward-compatible handler properties
  mouseDownHandler = this.handleMouseDown;
  mouseMoveHandler = this.handleMouseMove;
  mouseUpHandler = this.handleMouseUp;

  // Tool Helpers
  private eraseAt(x: number, y: number) {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      if (isPointInShape(x, y, shape, WhiteboardEngine.ERASER_TOLERANCE)) {
        this.shapes.splice(i, 1);
        this.myShapeIds.delete(shape.id);
        this.render();
        this.sendDeleteShape(shape.id);
        this.isDrawing = false;
        return;
      }
    }
    this.isDrawing = false;
  }

  private startTextInput(e: MouseEvent) {
    if (this.activeTextInput) {
      this.activeTextInput.blur();
    }

    const spawnX = this.startX;
    const spawnY = this.startY;

    const input = document.createElement("input");
    this.activeTextInput = input;
    input.type = "text";

    Object.assign(input.style, {
      position: "fixed",
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      fontFamily: TEXT_FONT_FAMILY,
      fontSize: `${TEXT_FONT_SIZE}px`,
      color: "#1f2937",
      background: "transparent",
      border: "none",
      outline: "none",
      zIndex: "1000",
      padding: "0",
      margin: "0",
      lineHeight: "1.2",
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
      if (rawText.trim() === "") {
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
        this.rc.rectangle(this.startX, this.startY, width, height, strokeOptions);
        break;

      case "circle": {
        const radiusX = width / 2;
        const radiusY = height / 2;
        const centerX = this.startX + radiusX;
        const centerY = this.startY + radiusY;
        const diameter = Math.max(Math.abs(radiusX), Math.abs(radiusY)) * 2;
        this.rc.circle(centerX, centerY, diameter, strokeOptions);
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
        const midX = this.startX + width / 2;
        const midY = this.startY + height / 2;
        this.rc.polygon(
          [
            [midX, this.startY],
            [this.startX + width, midY],
            [midX, this.startY + height],
            [this.startX, midY],
          ],
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
    this.redoStack = [];
    this.render();
    this.sendShape(shape);
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

  private safeSend(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.offlineQueue.push(message);
      console.warn("WebSocket offline: message queued");
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
