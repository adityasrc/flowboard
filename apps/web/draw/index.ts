import axios from "axios";
import { HTTP_BACKEND } from "@/config";


type Shape = {
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
    } | {
        type: "Pencil",
        startX: number,
        startY: number,
        endX: number
        endY: number
    }

export default async function initDraw(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    const ctx = canvas.getContext("2d");

    let shapes : Shape[] = await getExistingShapes(roomId);

    if (!ctx) return;

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if(message.type == "chat"){
            const parsedData = JSON.parse(message.message);
            shapes.push(parsedData.shape); //shape is stored as text
            existingShapes(shapes, canvas, ctx);
        }
    }

    // ctx.fillStyle = "black";
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // rect(x, y, width, height)
    // ctx.strokeRect(10, 20, 150, 100);

    existingShapes(shapes, canvas, ctx);

    let isClicked = false;
    let startX = 0;
    let startY = 0;


    canvas.addEventListener("mousedown", (e) => {
        isClicked = true;
        startX = e.clientX;
        startY = e.clientY;
    })

    canvas.addEventListener("mousemove", (e) => {
        if (isClicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // ctx.fillStyle = "black";  //background ko black kar dega
            // ctx.fillRect(0, 0, canvas.width, canvas.height);
            existingShapes(shapes, canvas, ctx);
            ctx.strokeStyle = "white";  //boundary will be white
            ctx.strokeRect(startX, startY, width, height);
        }
    })

    window.addEventListener("mouseup", (e) => {
        isClicked = false;
        const width = e.clientX-startX;
        const height = e.clientY-startY;
        const shape: Shape = {
            type: "Rect",
            x: startX, 
            y: startY, 
            width: width, 
            height: height
        }
        shapes.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId
        }))
    })
}

function existingShapes(shapes : Shape[], canvas: HTMLCanvasElement, ctx : CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height); //canvas clear karenge

    //canvas ko black karenge
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    shapes.forEach((shape) => {
        if(shape.type === "Rect"){
            ctx.strokeStyle = "white";
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    });
}

async function getExistingShapes(roomid: string){
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomid}`);
    const messages = res.data.messages;

    const shapes = messages.map((msg: any) => { //map because it returns a new array
        const shapeData = JSON.parse(msg.message)
        return shapeData.shape;
    })

    return shapes;
}