
type Shape = {
    type: "Rect"; //hardcoded the types of shapes
    x: number;
    y: number;
    width: number;
    height: number;
}
    | {
        type: "Circle";
        x: number;
        y: number;
        radius: number;
    }

export default function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // rect(x, y, width, height)
    // ctx.strokeRect(10, 20, 150, 100);

    let shapes : Shape[] = [];

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
            existingShape(shapes, canvas, ctx);
            ctx.strokeStyle = "white";  //boundary will be white
            ctx.strokeRect(startX, startY, width, height);
        }
    })

    window.addEventListener("mouseup", (e) => {
        isClicked = false;
        const width = e.clientX-startX;
        const height = e.clientY-startY;
        shapes.push({
            type: "Rect",
            x: startX, 
            y: startY, 
            width: width, 
            height: height
        });
    })
}

function existingShape(shapes : Shape[], canvas: HTMLCanvasElement, ctx : CanvasRenderingContext2D){
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
