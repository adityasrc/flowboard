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
    }
  | {
      type: "Circle";
      centerX: number;
      centerY: number;
      radius: number;
      seed: number;
    }
  | {
      type: "Pencil";
      points: [number, number][]; // array of [x, y] (2d array)
      seed: number;
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

  private selectedTool: Tool = "circle";
  private getCoordinates(e: MouseEvent){
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX-rect.left;
    const y = e.clientY-rect.top;
    return {x, y};
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

    //constructors cant be async
  }


  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);

    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);

    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(Tool: "rect" | "circle" | "pencil" | "eraser") {
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
        this.shapes.push(parsedData.shape); //shape is stored as text
        this.existingShapes();
      }
    };
  }

  existingShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //canvas clear karenge

    //canvas ko black karenge
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

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
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.isClicked = true;
    const {x, y} = this.getCoordinates(e);
    this.startX = x;
    this.startY = y;
    this.currentSeed = rough.newSeed();
    const selectedTool = this.selectedTool;
    if (selectedTool === "pencil") {
      this.currentPath = [];
      this.currentPath = [[x, y]];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isClicked = false;
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
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "Circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius: radius,
        seed: this.currentSeed,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        type: "Pencil",
        points: this.currentPath,
        seed: this.currentSeed,
      };
    }
    if (!shape) {
      return;
    }

    this.shapes.push(shape);

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
      const {x, y} = this.getCoordinates(e);
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
        const radius = Math.max(width, height) / 2;
        const centerX = this.startX + radius;
        const centerY = this.startY + radius;
        // this.ctx.beginPath();
        // this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
        // this.ctx.stroke();
        // this.ctx.closePath();

        this.rc.circle(centerX, centerY, Math.abs(radius) * 2, {
          stroke: "black",
          seed: this.currentSeed,
        });
      } else if (selectedTool === "pencil") {
        this.currentPath.push([x, y]);
        this.rc.linearPath(this.currentPath, {
          stroke: "black",
          seed: this.currentSeed,
        });
      }
    }
  };
  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
