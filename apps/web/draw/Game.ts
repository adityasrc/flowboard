import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";
import rough from "roughjs";

type Shape =
  | {
      type: "Rect"; //hardcoded the types of shapes
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
      points: [number, number][]; // array of [x, y] (2d array)
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
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private isClicked: boolean;
  private rc: any;
  private currentSeed = 0;
  private currentPath: [number, number][] = [];
  private startX = 0;
  private startY = 0;
  private tolerance = 5;
  private redoStack: Shape[];
  private rafId: number | null = null; //requestanimationframe id

  private selectedTool: Tool = "circle";
  private getCoordinates(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  }

  private isPointInShapes(x: number, y: number, shape: Shape): boolean {
    if (shape.type === "Rect" || shape.type === "Diamond") {
      const minX = Math.min(shape.x, shape.x + shape.width); //to safeguard reverse drag using min max
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
      //pythagoras theorem
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

      if( distance <= this.tolerance){
        return true; // line ke liye
      }

      if(shape.type === "Arrow"){
        const distanceToTip = Math.sqrt(
          Math.pow(x-shape.endX, 2) + Math.pow(y - shape.endY, 2)
        );

        if(distanceToTip <= 15){
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

    //(Teer ka math)
    const angle = Math.atan2(endY - startY, endX - startX);
    const headLength = 15; // arrow ke head ka size

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
    // ! made type error go why?
    // we are telling the ts that we know ctx wont be null in any case
    this.roomId = roomId;
    this.socket = socket;
    this.isClicked = false;
    this.shapes = [];
    this.init();
    this.initHandlers();
    this.initMouseHandler();
    this.rc = rough.canvas(canvas);
    this.redoStack = [];

    window.addEventListener("keydown", this.handleKeyDown);

    //constructors cant be async
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);

    window.removeEventListener("keydown", this.handleKeyDown);
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
      | "diamond",
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
        ); // to prevent double renderign of shapes

        if (!shapeExists) {
          this.shapes.push(parsedData.shape); //shape is stored as text
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
    if (this.shapes.length > 0) {
      let lastShape = this.shapes.pop()!;
      this.redoStack.push(lastShape);
      this.existingShapes();

      this.socket.send(
        JSON.stringify({
          type: "delete_shape", // Naya message type
          id: lastShape.id, // Kis id ko mitaana hai
          roomId: this.roomId,
        }),
      );
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
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //canvas clear karenge

    //canvas ko black karenge
    // this.ctx.fillStyle = "#ffffff";
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.shapes.forEach((shape) => {
      // this.ctx.strokeStyle = "black";
      if (shape.type === "Rect") {
        // this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        this.rc.rectangle(shape.x, shape.y, shape.width, shape.height, {
          stroke: "black",
          seed: shape.seed,
        });
      } else if (shape.type === "Circle") {
        // this.ctx.beginPath();
        // this.ctx.arc(
        //   shape.centerX,
        //   shape.centerY,
        //   Math.abs(shape.radius),
        //   0,
        //   Math.PI * 2,
        // );
        // this.ctx.stroke();
        // this.ctx.closePath();
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
      }
      else if(shape.type === "Diamond"){
        const midX = shape.x + shape.width / 2;
        const midY = shape.y + shape.height / 2;

        this.rc.polygon([
          [midX, shape.y],
          [shape.x + shape.width, midY],
          [midX, shape.y + shape.height],
          [shape.x, midY]
        ], { 
            stroke: "black", 
            seed: shape.seed, // BUG 1 FIXED HERE
        });

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
      this.currentPath = [];
      this.currentPath = [[x, y]];
    }

    if (selectedTool === "eraser") {
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
        if (this.isPointInShapes(x, y, shape)) {
          this.shapes.splice(i, 1); //splice (index, count(number of element to be removed))
          this.existingShapes();
          if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(
              JSON.stringify({
                type: "delete_shape", // Naya message type
                id: shape.id, // Kis id ko mitaana hai
                roomId: this.roomId,
              }),
            );
          }
          this.isClicked = false;
          return;
        }
      }
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isClicked = false;
    if(this.rafId){
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
        id: crypto.randomUUID(), //uuid matlab universal unique id , its random
      };
    } else if (selectedTool === "circle") {
      // BUG 2 FIXED HERE
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

    this.redoStack = []; //naya shape bante hi redo stack khali karna hai.
    
    this.existingShapes(); // BUG 3 FIXED HERE

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

      // pencil ke points miss na ho isliye isko pehle hi array me daal denge
      if (this.selectedTool === "pencil") {
        this.currentPath.push([x, y]);
      }

      // agar purana frame pending hai toh usko cancel karenge vibration rokne ke liye
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
      }

      // naya frame schedule karenge browser sync ke sath
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        const width = x - this.startX;
        const height = y - this.startY;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = "black";  //background ko black kar dega
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.existingShapes();
        // this.ctx.strokeStyle = "black"; //boundary will be black
        const selectedTool = this.selectedTool;
        if (selectedTool === "rect") {
          // this.ctx.strokeRect(this.startX, this.startY, width, height);
          this.rc.rectangle(this.startX, this.startY, width, height, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "circle") {
          // BUG 2 FIXED HERE
          const radiusX = width / 2;
          const radiusY = height / 2;
          const centerX = this.startX + radiusX;
          const centerY = this.startY + radiusY;
          const radius = Math.max(Math.abs(radiusX), Math.abs(radiusY));

          // this.ctx.beginPath();
          // this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
          // this.ctx.stroke();
          // this.ctx.closePath();

          this.rc.circle(centerX, centerY, radius * 2, {
            stroke: "black",
            seed: this.currentSeed,
          });
        } else if (selectedTool === "pencil") {
          // currentPath me points upar push ho chuke hai, bas draw karna hai
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
            stroke: "black", seed: this.currentSeed,
          });
        }
      });
    }
  };
  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}