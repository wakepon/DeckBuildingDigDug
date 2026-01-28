/**
 * Math utility functions for common calculations
 */

/**
 * Calculate Euclidean distance between two points
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns The distance between the two points
 */
export function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the delta (dx, dy) and distance between two points
 * Useful when you need both direction and distance
 * @param x1 - First point X coordinate
 * @param y1 - First point Y coordinate
 * @param x2 - Second point X coordinate
 * @param y2 - Second point Y coordinate
 * @returns Object with dx, dy, and distance
 */
export function getDistanceWithDelta(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { dx: number; dy: number; distance: number } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return { dx, dy, distance };
}

/**
 * Normalize a vector (make it unit length)
 * @param x - X component
 * @param y - Y component
 * @returns Normalized vector, or {x: 0, y: 0} if length is 0
 */
export function normalize(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: x / length,
    y: y / length,
  };
}
