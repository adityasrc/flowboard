import type { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "./types";

// Draws an arrow line with a two-segment arrowhead at the tip.
export function drawArrow(
  rc: RoughCanvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number,
) {
  rc.line(startX, startY, endX, endY, { stroke: "black", seed });

  const angle = Math.atan2(endY - startY, endX - startX);
  const headLength = 15;

  const p1X = endX - headLength * Math.cos(angle - Math.PI / 6);
  const p1Y = endY - headLength * Math.sin(angle - Math.PI / 6);

  const p2X = endX - headLength * Math.cos(angle + Math.PI / 6);
  const p2Y = endY - headLength * Math.sin(angle + Math.PI / 6);

  rc.line(endX, endY, p1X, p1Y, { stroke: "black", seed });
  rc.line(endX, endY, p2X, p2Y, { stroke: "black", seed });
}

// Clears the canvas and redraws all shapes from scratch.
// Called whenever the shapes array changes (add, delete, undo, redo, incoming WS message).
export function renderShapes(
  ctx: CanvasRenderingContext2D,
  rc: RoughCanvas,
  shapes: Shape[],
  canvasWidth: number,
  canvasHeight: number,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  shapes.forEach((shape) => {
    if (shape.type === "Rect") {
      rc.rectangle(shape.x, shape.y, shape.width, shape.height, {
        stroke: "black",
        seed: shape.seed,
      });
    } else if (shape.type === "Circle") {
      rc.circle(
        shape.centerX,
        shape.centerY,
        Math.abs(shape.radius) * 2,
        { stroke: "black", seed: shape.seed },
      );
    } else if (shape.type === "Pencil") {
      rc.linearPath(shape.points, { stroke: "black", seed: shape.seed });
    } else if (shape.type === "Line") {
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, {
        stroke: "black",
        seed: shape.seed,
      });
    } else if (shape.type === "Arrow") {
      drawArrow(rc, shape.startX, shape.startY, shape.endX, shape.endY, shape.seed);
    } else if (shape.type === "Diamond") {
      const midX = shape.x + shape.width / 2;
      const midY = shape.y + shape.height / 2;

      rc.polygon(
        [
          [midX, shape.y],
          [shape.x + shape.width, midY],
          [midX, shape.y + shape.height],
          [shape.x, midY],
        ],
        { stroke: "black", seed: shape.seed },
      );
    } else if (shape.type === "Text") {
      ctx.font = "24px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillStyle = "black";
      ctx.fillText(shape.text, shape.x, shape.y + 3);
    }
  });
}
