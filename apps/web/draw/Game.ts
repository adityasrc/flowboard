import { getExistingShapes } from "./http";
import { Tool } from "../components/Canvas";

type Shape =
  | {
      type: "Rect"; //hardcoded the types of shapes
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "Circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "Pencil";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shapes: Shape[];
  private roomId: string;
  private socket: WebSocket;
  private isClicked: boolean;

  private startX = 0;
  private startY = 0;

  private selectedTool: Tool = "circle";

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

    //constructors cant be async
  }

  destroy(){
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
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.shapes.forEach((shape) => {
      if (shape.type === "Rect") {
        this.ctx.strokeStyle = "white";
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "Circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  mouseDownHandler = (e) => {
    this.isClicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  }

  mouseUpHandler = (e) => {
    this.isClicked = false;
    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;
    if (selectedTool === "rect") {
      shape = {
        type: "Rect",
        x: this.startX,
        y: this.startY,
        width: width,
        height: height,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;
      shape = {
        type: "Circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius: radius,
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
  }

  mouseMoveHandler = (e) => {
    if (this.isClicked) {
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        // ctx.fillStyle = "black";  //background ko black kar dega
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.existingShapes();
        this.ctx.strokeStyle = "white"; //boundary will be white
        const selectedTool = this.selectedTool;
        if (selectedTool === "rect") {
          this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (selectedTool === "circle") {
          const radius = Math.max(width, height) / 2;
          const centerX = this.startX + radius;
          const centerY = this.startY + radius;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        }
      }
  }
  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);

    this.canvas.addEventListener("mouseup", this.mouseUpHandler);

    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
