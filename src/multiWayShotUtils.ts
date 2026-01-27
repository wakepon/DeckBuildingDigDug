import { MULTI_WAY_SHOT_ANGLE_SPREAD } from './constants';

export interface BulletDirection {
  dirX: number;
  dirY: number;
}

/**
 * Calculate multiple bullet directions based on multi-way shot level.
 * Directions are spread symmetrically around the base direction.
 *
 * @param baseDirX - Base direction X component (toward mouse)
 * @param baseDirY - Base direction Y component (toward mouse)
 * @param level - Multi-way shot level (1 = single, 2 = two-way, etc.)
 * @returns Array of direction objects
 */
export function calculateMultiWayShotDirections(
  baseDirX: number,
  baseDirY: number,
  level: number
): BulletDirection[] {
  // Single shot - return original direction
  if (level <= 1) {
    return [{ dirX: baseDirX, dirY: baseDirY }];
  }

  // Calculate base angle and magnitude
  const baseAngle = Math.atan2(baseDirY, baseDirX);
  const magnitude = Math.sqrt(baseDirX * baseDirX + baseDirY * baseDirY);

  // Generate directions
  const directions: BulletDirection[] = [];

  for (let i = 0; i < level; i++) {
    // Calculate angle offset for this bullet
    // For level 2: offsets are [-spread/2, +spread/2]
    // For level 3: offsets are [-spread, 0, +spread]
    // For level 5: offsets are [-2*spread, -spread, 0, +spread, +2*spread]
    const offsetIndex = i - (level - 1) / 2;
    const angleOffset = offsetIndex * MULTI_WAY_SHOT_ANGLE_SPREAD;

    const angle = baseAngle + angleOffset;

    directions.push({
      dirX: Math.cos(angle) * magnitude,
      dirY: Math.sin(angle) * magnitude,
    });
  }

  return directions;
}
