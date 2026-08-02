import { Shape } from "./types";
import { Tool } from "../components/Canvas";

// Constructs a Shape object from the tool and mouse coordinates captured on mouseUp.
// Returns null for tools that don't produce a persistent shape (eraser, text, undo, redo).
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
