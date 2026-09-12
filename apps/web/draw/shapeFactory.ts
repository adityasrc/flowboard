import { Shape } from "./types";
import { Tool } from "../components/Canvas";
import { getCircleFromBounds } from "./geometry";

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
      const { centerX, centerY, radius } = getCircleFromBounds(
        startX,
        startY,
        endX,
        endY,
      );
      return {
        type: "Circle",
        centerX,
        centerY,
        radius,
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
