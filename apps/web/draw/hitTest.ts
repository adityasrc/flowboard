import { Shape } from "./types";

// Checks if a point (x, y) falls within a shape's hit area.
// The tolerance parameter adds a small margin for easier clicking.
export function isPointInShape(
  x: number,
  y: number,
  shape: Shape,
  tolerance: number,
): boolean {
  if (shape.type === "Rect" || shape.type === "Diamond") {
    const minX = Math.min(shape.x, shape.x + shape.width);
    const maxX = Math.max(shape.x, shape.x + shape.width);

    const minY = Math.min(shape.y, shape.y + shape.height);
    const maxY = Math.max(shape.y, shape.y + shape.height);

    return (
      x >= minX - tolerance &&
      x <= maxX + tolerance &&
      y >= minY - tolerance &&
      y <= maxY + tolerance
    );
  }

  if (shape.type === "Circle") {
    const distance = Math.sqrt(
      Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2),
    );
    return Math.abs(shape.radius) >= distance;
  }

  if (shape.type === "Pencil") {
    for (let i = 0; i < shape.points.length; i++) {
      const point = shape.points[i];
      const px = point[0];
      const py = point[1];

      const base = x - px;
      const height = y - py;

      const distance = Math.sqrt(base * base + height * height);

      if (distance <= tolerance * 3) {
        return true;
      }
    }
  }

  if (shape.type === "Line" || shape.type === "Arrow") {
    const A = x - shape.startX;
    const B = y - shape.startY;
    const C = shape.endX - shape.startX;
    const D = shape.endY - shape.startY;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = shape.startX;
      yy = shape.startY;
    } else if (param > 1) {
      xx = shape.endX;
      yy = shape.endY;
    } else {
      xx = shape.startX + param * C;
      yy = shape.startY + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= tolerance) {
      return true;
    }

    if (shape.type === "Arrow") {
      const distanceToTip = Math.sqrt(
        Math.pow(x - shape.endX, 2) + Math.pow(y - shape.endY, 2),
      );

      if (distanceToTip <= 15) {
        return true;
      }
    }
  }

  return false;
}
