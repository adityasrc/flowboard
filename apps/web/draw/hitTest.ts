import { Shape } from "./types";
import { TEXT_FONT_SIZE } from "./renderer";
import { ARROW_HEAD_LENGTH } from "./geometry";

export function isPointInShape(
  x: number,
  y: number,
  shape: Shape,
  tolerance: number,
): boolean {
  if (shape.type === "Text") {
    const approxCharWidth = TEXT_FONT_SIZE * 0.5;
    const width = shape.text.length * approxCharWidth;
    const height = TEXT_FONT_SIZE;

    return (
      x >= shape.x - tolerance &&
      x <= shape.x + width + tolerance &&
      y >= shape.y - tolerance &&
      y <= shape.y + height + tolerance
    );
  }

  if (shape.type === "Rect") {
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

  if (shape.type === "Diamond") {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    const halfWidth = Math.abs(shape.width) / 2;
    const halfHeight = Math.abs(shape.height) / 2;

    if (halfWidth === 0 || halfHeight === 0) {
      return false;
    }

    const dx = Math.abs(x - centerX);
    const dy = Math.abs(y - centerY);

    return dx / halfWidth + dy / halfHeight <= 1;
  }

  if (shape.type === "Circle") {
    const distance = Math.hypot(x - shape.centerX, y - shape.centerY);
    return shape.radius >= distance;
  }

  if (shape.type === "Pencil") {
    for (let i = 0; i < shape.points.length; i++) {
      const point = shape.points[i];
      const px = point[0];
      const py = point[1];

      const distance = Math.hypot(x - px, y - py);

      // Exceeds pencil sample distance to prevent hit-test gaps
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

    const distance = Math.hypot(x - xx, y - yy);

    if (distance <= tolerance) {
      return true;
    }

    if (shape.type === "Arrow") {
      const distanceToTip = Math.hypot(x - shape.endX, y - shape.endY);

      if (distanceToTip <= ARROW_HEAD_LENGTH) {
        return true;
      }
    }
  }

  return false;
}
