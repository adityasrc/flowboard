import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";
import { Shape } from "./types";
import { isPointInShape } from "./hitTest";
import { renderShapes, drawArrow } from "./renderer";
import { createShape } from "./shapeFactory";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";


export class WhiteboardEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private isClicked: boolean;
  private rc: RoughCanvas;
  private currentSeed = 0;
  private currentPath: [number, number][] = [];
  private startX = 0;
  private startY = 0;
  private tolerance = 5;
  private redoStack: Shape[];
  private rafId: number | null = null;
  private offlineQueue: string[] = [];

  private selectedTool: Tool = "circle";
  private myShapeIds: Set<string> = new Set();

  // Tracks any active text box to prevent orphaned DOM elements on page navigation
  private activeTextInput: HTMLInputElement | null = null;

  // Only points farther than PENCIL_MIN_DISTANCE from the previous point are
  // added to currentPath. This trims redundant collinear samples at no visible
  // quality cost and keeps the WS payload lean.
  private lastPencilPoint: [number, number] | null = null;
  private readonly PENCIL_MIN_DISTANCE = 5;

  private getCoordinates(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "z") {
      this.undo();
    }
    if (e.ctrlKey && e.key === "y") {
      this.redo();
    }
  };


  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.isClicked = false;
    this.shapes = [];
    this.rc = rough.canvas(canvas);
    this.redoStack = [];

    this.init();
    this.initHandlers();
    this.initMouseHandler();

    window.addEventListener("keydown", this.handleKeyDown);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    // Cleanly removes window listener to prevent sticky drag bugs
    window.removeEventListener("mouseup", this.mouseUpHandler);
    window.removeEventListener("keydown", this.handleKeyDown);

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Wipes any active text input box if user navigates away while typing
    if (this.activeTextInput) {
      this.activeTextInput.remove();
      this.activeTextInput = null;
    }
  }

  setTool(
    Tool:
      | "rect"
      | "circle"
      | "pencil"
      | "eraser"
      | "undo"
      | "redo"
      | "line"
      | "arrow"
      | "diamond"
      | "text",
  ) {
    this.selectedTool = Tool;
  }

  async init() {
    this.shapes = await getExistingShapes(this.roomId);
    this.render();
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type == "chat") {
        const parsedData = JSON.parse(message.message);
        const incomingShape = parsedData.shape;
        const shapeExists = this.shapes.find(
          (shape) => shape.id === incomingShape.id,
        );

        if (!shapeExists) {
          this.shapes.push(parsedData.shape);
          this.render();
        }
      } else if (message.type == "delete_shape") {
        const idToDelete = message.id;
        this.shapes = this.shapes.filter((s) => s.id !== idToDelete);
        this.render();
      }
    };
  }

  private safeSend(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      this.offlineQueue.push(message);
      console.error("Offline mode: Message added to queue");
    }
  }

  flushQueue() {
    while (this.offlineQueue.length > 0) {
      const message = this.offlineQueue.shift();
      if (message) {
        this.socket.send(message);
      }
    }
  }

  undo() {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.myShapeIds.has(this.shapes[i].id)) {
        const [removed] = this.shapes.splice(i, 1);
        this.myShapeIds.delete(removed.id);
        this.redoStack.push(removed);
        this.render();

        this.safeSend(
          JSON.stringify({
            type: "delete_shape",
            id: removed.id,
            roomId: this.roomId,
          }),
        );
        return;
      }
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      let lastShape = this.redoStack.pop()!;
      
      // 1. Add back to global shapes array
      this.shapes.push(lastShape);
      
      // Agar ye nahi karenge, toh dobara undo nahi ho payega.
      this.myShapeIds.add(lastShape.id);
      
      // Re-render canvas
      this.render();

      // 4. Broadcast to other users
      this.safeSend(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({
            shape: lastShape,
          }),
          roomId: this.roomId,
        }),
      );
    }
  }

  // Delegates to the standalone renderShapes function.
  // Kept as a thin wrapper so external callers (Canvas.tsx resize handler) can call engine.render().
  render() {
    renderShapes(this.ctx, this.rc, this.shapes, this.canvas.width, this.canvas.height);
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.isClicked = true;
    const { x, y } = this.getCoordinates(e);
    this.startX = x;
    this.startY = y;
    this.currentSeed = rough.newSeed();
    const selectedTool = this.selectedTool;

    if (selectedTool === "pencil") {
      this.currentPath = [[x, y]];
      this.lastPencilPoint = [x, y];
    }

    if (selectedTool === "eraser") {
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
        if (isPointInShape(x, y, shape, this.tolerance)) {
          this.shapes.splice(i, 1);
          this.render();
          this.safeSend(
            JSON.stringify({
              type: "delete_shape",
              id: shape.id,
              roomId: this.roomId,
            }),
          );
          this.isClicked = false;
          return;
        }
      }
    }

    if (selectedTool === "text") {
      this.isClicked = false;

      const input = document.createElement("input");
      this.activeTextInput = input; // Track in class for unmount safety

      input.type = "text";
      input.placeholder = "";
      input.style.position = "fixed";
      input.style.left = `${e.clientX}px`;
      input.style.top = `${e.clientY}px`;
      input.style.font = "24px sans-serif";
      input.style.background = "transparent";
      input.style.border = "none";
      input.style.outline = "none";
      input.style.zIndex = "1000";
      input.style.padding = "0";
      input.style.margin = "0";
      input.style.lineHeight = "1";

      document.body.appendChild(input);
      setTimeout(() => input.focus(), 0);

      input.addEventListener("blur", () => {
        const textValue = input.value.trim();

        if (textValue !== "") {
          const textShape: Shape = {
            type: "Text",
            text: textValue,
            x: this.startX,
            y: this.startY,
            seed: this.currentSeed,
            id: crypto.randomUUID(),
          };

          this.shapes.push(textShape);
          this.myShapeIds.add(textShape.id);
          this.render();

          this.safeSend(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({ shape: textShape }),
              roomId: this.roomId,
            }),
          );
        }

        input.remove();
        if (this.activeTextInput === input) {
          this.activeTextInput = null;
        }
      });

      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          input.blur();
        }
      });

      return;
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    if (!this.isClicked) return;
    this.isClicked = false;

    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    const { x, y } = this.getCoordinates(e);
    const selectedTool = this.selectedTool;

    const shape = createShape(
      selectedTool,
      this.startX,
      this.startY,
      x,
      y,
      this.currentSeed,
      this.currentPath,
    );

    if (!shape) {
      return;
    }

    this.shapes.push(shape);
    this.myShapeIds.add(shape.id);
    this.redoStack = [];

    this.render();

    this.safeSend(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({
          shape,
        }),
        roomId: this.roomId,
      }),
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (this.isClicked) {
      if (this.selectedTool === "eraser") return;

      const { x, y } = this.getCoordinates(e);

      if (this.selectedTool === "pencil") {
        const lp = this.lastPencilPoint;
        const dist = lp ? Math.hypot(x - lp[0], y - lp[1]) : Infinity;
        if (dist >= this.PENCIL_MIN_DISTANCE) {
          this.currentPath.push([x, y]);
          this.lastPencilPoint = [x, y];
        }
      }

      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }

      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const width = x - this.startX;
        const height = y - this.startY;

        this.render();
        const selectedTool = this.selectedTool;

        if (selectedTool === "rect") {
          this.rc.rectangle(this.startX, this.startY, width, height, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "circle") {
          const radiusX = width / 2;
          const radiusY = height / 2;
          const centerX = this.startX + radiusX;
          const centerY = this.startY + radiusY;
          const radius = Math.max(Math.abs(radiusX), Math.abs(radiusY));

          this.rc.circle(centerX, centerY, radius * 2, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "pencil") {
          this.rc.linearPath(this.currentPath, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "line") {
          this.rc.line(this.startX, this.startY, x, y, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "arrow") {
          drawArrow(this.rc, this.startX, this.startY, x, y, this.currentSeed);
        } else if (selectedTool === "diamond") {
          const midX = this.startX + width / 2;
          const midY = this.startY + height / 2;

          this.rc.polygon([
            [midX, this.startY],
            [this.startX + width, midY],
            [midX, this.startY + height],
            [this.startX, midY],
          ], {
            stroke: "black",
            seed: this.currentSeed,
          });
        }
      });
    }
  };

  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);

    // Bounded to window to ensure dragging outside canvas stops drawing cleanly
    window.addEventListener("mouseup", this.mouseUpHandler);
  }
}