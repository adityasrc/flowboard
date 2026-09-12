export const ARROW_HEAD_LENGTH = 15;

/**
 * Calculates the 4 vertices of a diamond/rhombus inscribed in the bounding box (x, y, width, height).
 */
export function getDiamondPoints(
  x: number,
  y: number,
  width: number,
  height: number,
): [number, number][] {
  const midX = x + width / 2;
  const midY = y + height / 2;
  return [
    [midX, y],
    [x + width, midY],
    [midX, y + height],
    [x, midY],
  ];
}

/**
 * Derives center coordinates and uniform radius from a drag bounding box.
 */
export function getCircleFromBounds(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
): { centerX: number; centerY: number; radius: number } {
  const radiusX = (endX - startX) / 2;
  const radiusY = (endY - startY) / 2;
  return {
    centerX: startX + radiusX,
    centerY: startY + radiusY,
    radius: Math.max(Math.abs(radiusX), Math.abs(radiusY)),
  };
}
