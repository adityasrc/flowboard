import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";

type Shape =
  | {
    type: "Rect";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
    id: string;
  }
  | {
    type: "Circle";
    centerX: number;
    centerY: number;
    radius: number;
    seed: number;
    id: string;
  }
  | {
    type: "Pencil";
    points: [number, number][];
    seed: number;
    id: string;
  }
  | {
    type: "Line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    seed: number;
    id: string;
  }
  | {
    type: "Arrow";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    seed: number;
    id: string;
  }
  | {
    type: "Diamond";
    x: number;
    y: number;
    width: number;
    height: number;
    seed: number;
    id: string;
  }
  | {
    type: "Text";
    text: string;
    x: number;
    y: number;
    seed: number;
    id: string;
  };

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

  private isPointInShapes(x: number, y: number, shape: Shape): boolean {
    if (shape.type === "Rect" || shape.type === "Diamond") {
      const minX = Math.min(shape.x, shape.x + shape.width);
      const maxX = Math.max(shape.x, shape.x + shape.width);

      const minY = Math.min(shape.y, shape.y + shape.height);
      const maxY = Math.max(shape.y, shape.y + shape.height);

      return (
        x >= minX - this.tolerance &&
        x <= maxX + this.tolerance &&
        y >= minY - this.tolerance &&
        y <= maxY + this.tolerance
      );
    }
    if (shape.type === "Circle") {
      const distance = Math.sqrt(
        Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2),
      );
      return Math.abs(shape.radius) >= distance;
    }

    if (shape.type === "Pencil") {
      for (let i = 0; i < shape.points.length; i++) {
        const point = shape.points[i];
        const px = point[0];
        const py = point[1];

        const base = x - px;
        const height = y - py;

        const distance = Math.sqrt(base * base + height * height);

        if (distance <= this.tolerance * 3) {
          return true;
        }
      }
    }

    if (shape.type === "Line" || shape.type === "Arrow") {
      const A = x - shape.startX;
      const B = y - shape.startY;
      const C = shape.endX - shape.startX;
      const D = shape.endY - shape.startY;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;
      if (param < 0) {
        xx = shape.startX;
        yy = shape.startY;
      } else if (param > 1) {
        xx = shape.endX;
        yy = shape.endY;
      } else {
        xx = shape.startX + param * C;
        yy = shape.startY + param * D;
      }

      const dx = x - xx;
      const dy = y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= this.tolerance) {
        return true;
      }

      if (shape.type === "Arrow") {
        const distanceToTip = Math.sqrt(
          Math.pow(x - shape.endX, 2) + Math.pow(y - shape.endY, 2)
        );

        if (distanceToTip <= 15) {
          return true;
        }
      }
    }
    return false;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === "z") {
      this.undo();
    }
    if (e.ctrlKey && e.key === "y") {
      this.redo();
    }
  };

  private drawArrow(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    seed: number,
  ) {
    this.rc.line(startX, startY, endX, endY, { stroke: "black", seed: seed });

    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 15;

    const p1X = endX - headLength * Math.cos(angle - Math.PI / 6);
    const p1Y = endY - headLength * Math.sin(angle - Math.PI / 6);

    const p2X = endX - headLength * Math.cos(angle + Math.PI / 6);
    const p2Y = endY - headLength * Math.sin(angle + Math.PI / 6);

    this.rc.line(endX, endY, p1X, p1Y, { stroke: "black", seed: seed });
    this.rc.line(endX, endY, p2X, p2Y, { stroke: "black", seed: seed });
  }

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
    this.existingShapes();
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
          this.existingShapes();
        }
      } else if (message.type == "delete_shape") {
        const idToDelete = message.id;
        this.shapes = this.shapes.filter((s) => s.id !== idToDelete);
        this.existingShapes();
      }
    };
  }

  undo() {
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.myShapeIds.has(this.shapes[i].id)) {
        const [removed] = this.shapes.splice(i, 1);
        this.myShapeIds.delete(removed.id);
        this.redoStack.push(removed);
        this.existingShapes();

        this.socket.send(
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
      this.shapes.push(lastShape);
      this.existingShapes();

      this.socket.send(
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

  existingShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.shapes.forEach((shape) => {
      if (shape.type === "Rect") {
        this.rc.rectangle(shape.x, shape.y, shape.width, shape.height, {
          stroke: "black",
          seed: shape.seed,
        });
      } else if (shape.type === "Circle") {
        this.rc.circle(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius) * 2,
          { stroke: "black", seed: shape.seed },
        );
      } else if (shape.type === "Pencil") {
        this.rc.linearPath(shape.points, { stroke: "black", seed: shape.seed });
      } else if (shape.type === "Line") {
        this.rc.line(shape.startX, shape.startY, shape.endX, shape.endY, {
          stroke: "black",
          seed: shape.seed,
        });
      } else if (shape.type === "Arrow") {
        this.drawArrow(
          shape.startX,
          shape.startY,
          shape.endX,
          shape.endY,
          shape.seed,
        );
      } else if (shape.type === "Diamond") {
        const midX = shape.x + shape.width / 2;
        const midY = shape.y + shape.height / 2;

        this.rc.polygon([
          [midX, shape.y],
          [shape.x + shape.width, midY],
          [midX, shape.y + shape.height],
          [shape.x, midY]
        ], {
          stroke: "black",
          seed: shape.seed,
        });
      } else if (shape.type === "Text") {
        this.ctx.font = "24px sans-serif";
        this.ctx.textBaseline = "top";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(shape.text, shape.x, shape.y + 3);
      }
    });
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
        if (this.isPointInShapes(x, y, shape)) {
          this.shapes.splice(i, 1);
          this.existingShapes();
          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: "delete_shape",
                id: shape.id,
                roomId: this.roomId,
              }),
            );
          }
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
          this.existingShapes();

          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: "chat",
                message: JSON.stringify({ shape: textShape }),
                roomId: this.roomId,
              })
            );
          }
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
    const width = x - this.startX;
    const height = y - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        width: width,
        height: height,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    } else if (selectedTool === "circle") {
      const radiusX = width / 2;
      const radiusY = height / 2;
      const centerX = this.startX + radiusX;
      const centerY = this.startY + radiusY;
      const radius = Math.max(Math.abs(radiusX), Math.abs(radiusY));

      shape = {
        type: "Circle",
        centerX: centerX,
        centerY: centerY,
        radius: radius,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "Pencil",
        points: this.currentPath,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    } else if (selectedTool === "line") {
      shape = {
        type: "Line",
        startX: this.startX,
        startY: this.startY,
        endX: x,
        endY: y,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    } else if (selectedTool === "arrow") {
      shape = {
        type: "Arrow",
        startX: this.startX,
        startY: this.startY,
        endX: x,
        endY: y,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    } else if (selectedTool === "diamond") {
      shape = {
        type: "Diamond",
        x: this.startX,
        y: this.startY,
        width: x - this.startX,
        height: y - this.startY,
        seed: this.currentSeed,
        id: crypto.randomUUID(),
      };
    }

    if (!shape) {
      return;
    }

    this.shapes.push(shape);
    this.myShapeIds.add(shape.id);
    this.redoStack = [];

    this.existingShapes();

    this.socket.send(
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

        this.existingShapes();
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
          this.drawArrow(this.startX, this.startY, x, y, this.currentSeed);
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