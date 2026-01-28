import { getDistance } from './utils/math';
import {
  AUTO_AIM_CONE_ANGLE,
  AUTO_AIM_MAX_RANGE,
} from './constants';

/**
 * Type of target for auto-aim
 */
export type TargetType = 'enemy' | 'wall';

/**
 * Target representation for auto-aim system
 */
export interface Target {
  x: number;
  y: number;
  type: TargetType;
}

/**
 * AutoAimSystem - Handles Vampire Survivors-style automatic targeting
 *
 * The system uses cone-based detection to find targets in the player's
 * aiming direction (typically mouse direction). Enemies are prioritized over walls.
 *
 * The reference direction can be any normalized vector - in BulletManager,
 * this is the direction from the player to the mouse cursor.
 */
export class AutoAimSystem {
  private _isEnabled: boolean = false;

  /**
   * Returns whether auto-aim is currently enabled
   */
  get isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Enable or disable auto-aim
   */
  setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
  }

  /**
   * Toggle auto-aim on/off
   * @returns The new enabled state
   */
  toggle(): boolean {
    this._isEnabled = !this._isEnabled;
    return this._isEnabled;
  }

  /**
   * Check if a target is within the aiming cone
   * @param playerX - Player X position
   * @param playerY - Player Y position
   * @param dirX - Reference direction X (typically mouse direction, should be normalized)
   * @param dirY - Reference direction Y (typically mouse direction, should be normalized)
   * @param targetX - Target X position
   * @param targetY - Target Y position
   * @returns True if target is within the aiming cone
   */
  isInCone(
    playerX: number,
    playerY: number,
    dirX: number,
    dirY: number,
    targetX: number,
    targetY: number
  ): boolean {
    // Check for zero reference direction
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
    if (dirLength < 0.0001) {
      return false;
    }

    // Normalize direction
    const normDirX = dirX / dirLength;
    const normDirY = dirY / dirLength;

    // Calculate vector from player to target
    const toTargetX = targetX - playerX;
    const toTargetY = targetY - playerY;
    const distance = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

    // Check distance
    if (distance > AUTO_AIM_MAX_RANGE || distance < 0.0001) {
      return false;
    }

    // Normalize vector to target
    const normToTargetX = toTargetX / distance;
    const normToTargetY = toTargetY / distance;

    // Calculate dot product to get angle
    const dot = normDirX * normToTargetX + normDirY * normToTargetY;

    // dot = cos(angle), so we compare with cos(halfConeAngle)
    const halfConeAngle = AUTO_AIM_CONE_ANGLE / 2;
    const cosHalfCone = Math.cos(halfConeAngle);

    return dot >= cosHalfCone;
  }

  /**
   * Find the best target within the aiming cone
   * Prioritizes enemies over walls, then picks closest
   * @param playerX - Player X position
   * @param playerY - Player Y position
   * @param dirX - Reference direction X (typically mouse direction)
   * @param dirY - Reference direction Y (typically mouse direction)
   * @param targets - Array of potential targets
   * @returns Best target or null if none found
   */
  findBestTarget(
    playerX: number,
    playerY: number,
    dirX: number,
    dirY: number,
    targets: readonly Target[]
  ): Target | null {
    if (!this._isEnabled) {
      return null;
    }

    // Check for zero reference direction
    const dirLength = Math.sqrt(dirX * dirX + dirY * dirY);
    if (dirLength < 0.0001) {
      return null;
    }

    // Filter targets in cone
    const targetsInCone = targets.filter(target =>
      this.isInCone(playerX, playerY, dirX, dirY, target.x, target.y)
    );

    if (targetsInCone.length === 0) {
      return null;
    }

    // Separate enemies and walls
    const enemies = targetsInCone.filter(t => t.type === 'enemy');
    const walls = targetsInCone.filter(t => t.type === 'wall');

    // Prioritize enemies over walls
    const priorityTargets = enemies.length > 0 ? enemies : walls;

    // Find closest target in priority group
    let closestTarget: Target | null = null;
    let closestDistance = Infinity;

    for (const target of priorityTargets) {
      const distance = getDistance(playerX, playerY, target.x, target.y);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = target;
      }
    }

    return closestTarget;
  }

  /**
   * Calculate the normalized direction from player to target
   * @param playerX - Player X position
   * @param playerY - Player Y position
   * @param targetX - Target X position
   * @param targetY - Target Y position
   * @returns Normalized direction vector
   */
  calculateAimDirection(
    playerX: number,
    playerY: number,
    targetX: number,
    targetY: number
  ): { x: number; y: number } {
    const dx = targetX - playerX;
    const dy = targetY - playerY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 0.0001) {
      return { x: 0, y: 0 };
    }

    return {
      x: dx / length,
      y: dy / length,
    };
  }

  /**
   * Get the aim direction based on auto-aim state and available targets
   * @param playerX - Player X position
   * @param playerY - Player Y position
   * @param refDirX - Reference direction X (typically mouse direction)
   * @param refDirY - Reference direction Y (typically mouse direction)
   * @param targets - Array of potential targets
   * @returns Direction to aim (normalized), or reference direction if no target found
   */
  getAimDirection(
    playerX: number,
    playerY: number,
    refDirX: number,
    refDirY: number,
    targets: readonly Target[]
  ): { x: number; y: number } {
    // Try to find a target with auto-aim
    const target = this.findBestTarget(playerX, playerY, refDirX, refDirY, targets);

    if (target) {
      return this.calculateAimDirection(playerX, playerY, target.x, target.y);
    }

    // Fall back to reference direction (typically mouse direction)
    const length = Math.sqrt(refDirX * refDirX + refDirY * refDirY);
    if (length < 0.0001) {
      return { x: 0, y: 0 };
    }

    return {
      x: refDirX / length,
      y: refDirY / length,
    };
  }
}
