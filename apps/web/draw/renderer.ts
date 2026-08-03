import type { RoughCanvas } from "roughjs/bin/canvas";
import { Shape } from "./types";

export const TEXT_FONT_SIZE = 22;
export const TEXT_FONT_FAMILY = '"Patrick Hand", cursive';
export const TEXT_FONT = `${TEXT_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
export const TEXT_BASELINE_OFFSET = 3;

export interface RemoteCursor {
  x: number;
  y: number;
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
  const headLength = 15;

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
      ctx.font = TEXT_FONT;
      ctx.textBaseline = "top";
      ctx.fillStyle = "#1f2937";
      ctx.fillText(shape.text, shape.x, shape.y + TEXT_BASELINE_OFFSET);
    }
  });
}

const CURSOR_COLORS = [
  "#0f172a", // slate-950
  "#334155", // slate-700
  "#4f46e5", // indigo-600
  "#047857", // emerald-700
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

    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = getCursorColor(userId);
    ctx.lineWidth = 1.25;
    ctx.lineJoin = "round";
    ctx.stroke();

    ctx.restore();
  });
}
