import { Shape } from "./types";
import { Tool } from "../components/Canvas";

export function createShape(
  tool: Tool,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  seed: number,
  currentPath: [number, number][],
): Shape | null {
  switch (tool) {
    case "rect":
      return {
        type: "Rect",
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        seed,
        id: crypto.randomUUID(),
      };

    case "circle": {
      const radiusX = (endX - startX) / 2;
      const radiusY = (endY - startY) / 2;
      return {
        type: "Circle",
        centerX: startX + radiusX,
        centerY: startY + radiusY,
        radius: Math.max(Math.abs(radiusX), Math.abs(radiusY)),
        seed,
        id: crypto.randomUUID(),
      };
    }

    case "pencil":
      return {
        type: "Pencil",
        points: currentPath,
        seed,
        id: crypto.randomUUID(),
      };

    case "line":
      return {
        type: "Line",
        startX,
        startY,
        endX,
        endY,
        seed,
        id: crypto.randomUUID(),
      };

    case "arrow":
      if (Math.hypot(endX - startX, endY - startY) < 4) {
        return null;
      }

      return {
        type: "Arrow",
        startX,
        startY,
        endX,
        endY,
        seed,
        id: crypto.randomUUID(),
      };

    case "diamond":
      return {
        type: "Diamond",
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
        seed,
        id: crypto.randomUUID(),
      };

    default:
      return null;
  }
}
