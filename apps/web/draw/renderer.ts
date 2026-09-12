import type { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "./types";
import { ARROW_HEAD_LENGTH, getDiamondPoints } from "./geometry";
export { ARROW_HEAD_LENGTH, getDiamondPoints } from "./geometry";

export const TEXT_FONT_SIZE = 22;
export const TEXT_FONT_FAMILY = '"Patrick Hand", cursive';
export const TEXT_FONT = `${TEXT_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
export const TEXT_BASELINE_OFFSET = 3;

export interface RemoteCursor {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  name: string;
  lastSeen: number;
}

export function drawArrow(
  rc: RoughCanvas,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number,
) {
  if (Math.hypot(endX - startX, endY - startY) < 4) {
    return;
  }

  rc.line(startX, startY, endX, endY, { stroke: "black", seed });

  const angle = Math.atan2(endY - startY, endX - startX);
  const headLength = ARROW_HEAD_LENGTH;

  const p1X = endX - headLength * Math.cos(angle - Math.PI / 6);
  const p1Y = endY - headLength * Math.sin(angle - Math.PI / 6);

  const p2X = endX - headLength * Math.cos(angle + Math.PI / 6);
  const p2Y = endY - headLength * Math.sin(angle + Math.PI / 6);

  rc.line(endX, endY, p1X, p1Y, { stroke: "black", seed });
  rc.line(endX, endY, p2X, p2Y, { stroke: "black", seed });
}

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
      rc.circle(shape.centerX, shape.centerY, Math.abs(shape.radius) * 2, {
        stroke: "black",
        seed: shape.seed,
      });
    } else if (shape.type === "Pencil") {
      rc.linearPath(shape.points, { stroke: "black", seed: shape.seed });
    } else if (shape.type === "Line") {
      rc.line(shape.startX, shape.startY, shape.endX, shape.endY, {
        stroke: "black",
        seed: shape.seed,
      });
    } else if (shape.type === "Arrow") {
      drawArrow(
        rc,
        shape.startX,
        shape.startY,
        shape.endX,
        shape.endY,
        shape.seed,
      );
    } else if (shape.type === "Diamond") {
      rc.polygon(
        getDiamondPoints(shape.x, shape.y, shape.width, shape.height),
        { stroke: "black", seed: shape.seed },
      );
    } else if (shape.type === "Text") {
      ctx.font = TEXT_FONT;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#1f2937";
      ctx.fillText(shape.text, shape.x, shape.y + TEXT_BASELINE_OFFSET);
    }
  });
}

const CURSOR_COLORS = [
  "hsl(221 39% 11%)",
  "hsl(239 84% 67%)",
  "hsl(160 84% 39%)",
  "hsl(25 95% 53%)",
  "hsl(330 81% 60%)",
];

function getCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}

export function renderCursors(
  ctx: CanvasRenderingContext2D,
  cursors: Map<string, RemoteCursor>,
) {
  cursors.forEach((cursor, userId) => {
    const color = getCursorColor(userId);
    ctx.save();
    ctx.translate(cursor.x, cursor.y);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 11);
    ctx.lineTo(2.8, 8.5);
    ctx.lineTo(4.8, 13);
    ctx.lineTo(6.2, 12.3);
    ctx.lineTo(4.5, 7.8);
    ctx.lineTo(8.5, 7.8);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    const label = cursor.name || "Collaborator";
    const labelWidth = ctx.measureText(label).width + 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(11, 12, labelWidth, 22, 5);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 17, 23);

    ctx.restore();
  });
}
