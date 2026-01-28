/**
 * Bounce utility functions for bullet reflection off walls.
 * Uses vector reflection formula: R = V - 2(V dot N)N
 */

import { BOUNCE_OFFSET } from './constants';

export interface Vector2D {
  x: number;
  y: number;
}

interface BounceResult {
  shouldBounce: boolean;
  newVelocity: Vector2D;
  newX: number;
  newY: number;
  bounceRemaining: number;
}

/**
 * Calculate the dot product of two vectors.
 */
function dotProduct(a: Vector2D, b: Vector2D): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Calculate the reflection vector using formula: R = V - 2(V dot N)N
 * @param velocity - The incoming velocity vector
 * @param normal - The surface normal (unit vector)
 * @returns The reflected velocity vector
 */
export function calculateReflectionVector(
  velocity: Vector2D,
  normal: Vector2D
): Vector2D {
  const dot = dotProduct(velocity, normal);
  return {
    x: velocity.x - 2 * dot * normal.x,
    y: velocity.y - 2 * dot * normal.y,
  };
}

/**
 * Determine the wall normal based on bullet velocity.
 * Uses the dominant axis of movement to determine which wall face was hit.
 * @param velocity - The bullet's velocity vector
 * @returns The normal vector pointing away from the wall
 */
export function determineWallNormal(velocity: Vector2D): Vector2D {
  const absX = Math.abs(velocity.x);
  const absY = Math.abs(velocity.y);

  if (absX >= absY) {
    // Horizontal movement is dominant - hit a vertical wall
    return {
      x: velocity.x > 0 ? -1 : 1,
      y: 0,
    };
  } else {
    // Vertical movement is dominant - hit a horizontal wall
    return {
      x: 0,
      y: velocity.y > 0 ? -1 : 1,
    };
  }
}

/**
 * Apply bounce logic to a bullet hitting a wall.
 * @param bulletX - Current bullet X position
 * @param bulletY - Current bullet Y position
 * @param velocity - Current bullet velocity
 * @param bounceRemaining - Number of bounces remaining
 * @param tileSize - Size of a tile in pixels
 * @returns BounceResult with new position, velocity, and remaining bounces
 */
export function applyBounce(
  bulletX: number,
  bulletY: number,
  velocity: Vector2D,
  bounceRemaining: number,
  tileSize: number
): BounceResult {
  // Cannot bounce if no bounces remaining
  if (bounceRemaining <= 0) {
    return {
      shouldBounce: false,
      newVelocity: velocity,
      newX: bulletX,
      newY: bulletY,
      bounceRemaining: 0,
    };
  }

  // Determine which wall face was hit based on velocity
  const normal = determineWallNormal(velocity);

  // Calculate reflected velocity
  const newVelocity = calculateReflectionVector(velocity, normal);

  // Calculate new position offset away from wall
  const gridX = Math.floor(bulletX / tileSize);
  const gridY = Math.floor(bulletY / tileSize);

  let newX = bulletX;
  let newY = bulletY;

  // Push bullet back outside the wall based on normal direction
  if (normal.x !== 0) {
    // Hit vertical wall
    if (normal.x < 0) {
      // Wall is to the right, push bullet to left edge of tile
      newX = gridX * tileSize - BOUNCE_OFFSET;
    } else {
      // Wall is to the left, push bullet to right edge of tile
      newX = (gridX + 1) * tileSize + BOUNCE_OFFSET;
    }
  }

  if (normal.y !== 0) {
    // Hit horizontal wall
    if (normal.y < 0) {
      // Wall is below, push bullet to top edge of tile
      newY = gridY * tileSize - BOUNCE_OFFSET;
    } else {
      // Wall is above, push bullet to bottom edge of tile
      newY = (gridY + 1) * tileSize + BOUNCE_OFFSET;
    }
  }

  return {
    shouldBounce: true,
    newVelocity,
    newX,
    newY,
    bounceRemaining: bounceRemaining - 1,
  };
}
