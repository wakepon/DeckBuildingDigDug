import { describe, it, expect } from 'vitest';
import {
  calculateReflectionVector,
  determineWallNormal,
  applyBounce,
  type Vector2D,
} from '../bounceUtils';

describe('bounceUtils', () => {
  describe('calculateReflectionVector', () => {
    it('should reflect horizontal velocity off vertical wall (left/right wall)', () => {
      // Bullet moving right hits a right wall
      const velocity: Vector2D = { x: 1, y: 0 };
      const normal: Vector2D = { x: -1, y: 0 }; // Wall facing left

      const result = calculateReflectionVector(velocity, normal);

      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should reflect vertical velocity off horizontal wall (top/bottom wall)', () => {
      // Bullet moving down hits a bottom wall
      const velocity: Vector2D = { x: 0, y: 1 };
      const normal: Vector2D = { x: 0, y: -1 }; // Wall facing up

      const result = calculateReflectionVector(velocity, normal);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-1);
    });

    it('should reflect diagonal velocity off vertical wall', () => {
      // Bullet moving right-down hits a right wall
      const velocity: Vector2D = { x: 1, y: 1 };
      const normal: Vector2D = { x: -1, y: 0 }; // Wall facing left

      const result = calculateReflectionVector(velocity, normal);

      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(1);
    });

    it('should reflect diagonal velocity off horizontal wall', () => {
      // Bullet moving right-down hits a bottom wall
      const velocity: Vector2D = { x: 1, y: 1 };
      const normal: Vector2D = { x: 0, y: -1 }; // Wall facing up

      const result = calculateReflectionVector(velocity, normal);

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(-1);
    });

    it('should preserve velocity magnitude after reflection', () => {
      const velocity: Vector2D = { x: 3, y: 4 }; // magnitude = 5
      const normal: Vector2D = { x: -1, y: 0 };

      const result = calculateReflectionVector(velocity, normal);
      const originalMagnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      const resultMagnitude = Math.sqrt(result.x ** 2 + result.y ** 2);

      expect(resultMagnitude).toBeCloseTo(originalMagnitude);
    });

    it('should handle 45 degree angle reflection correctly', () => {
      // Bullet at 45 degrees hitting wall perpendicular
      const velocity: Vector2D = { x: 1, y: 1 };
      const normal: Vector2D = { x: -Math.SQRT1_2, y: -Math.SQRT1_2 }; // 45 degree wall

      const result = calculateReflectionVector(velocity, normal);

      // Reflected vector should point opposite
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(-1);
    });
  });

  describe('determineWallNormal', () => {
    it('should return left-facing normal when bullet enters from left', () => {
      // Bullet moving right (entered from left)
      const velocity: Vector2D = { x: 5, y: 0 };

      const normal = determineWallNormal(velocity);

      expect(normal.x).toBeCloseTo(-1);
      expect(normal.y).toBeCloseTo(0);
    });

    it('should return right-facing normal when bullet enters from right', () => {
      // Bullet moving left (entered from right)
      const velocity: Vector2D = { x: -5, y: 0 };

      const normal = determineWallNormal(velocity);

      expect(normal.x).toBeCloseTo(1);
      expect(normal.y).toBeCloseTo(0);
    });

    it('should return up-facing normal when bullet enters from top', () => {
      // Bullet moving down (entered from top)
      const velocity: Vector2D = { x: 0, y: 5 };

      const normal = determineWallNormal(velocity);

      expect(normal.x).toBeCloseTo(0);
      expect(normal.y).toBeCloseTo(-1);
    });

    it('should return down-facing normal when bullet enters from bottom', () => {
      // Bullet moving up (entered from bottom)
      const velocity: Vector2D = { x: 0, y: -5 };

      const normal = determineWallNormal(velocity);

      expect(normal.x).toBeCloseTo(0);
      expect(normal.y).toBeCloseTo(1);
    });

    it('should determine dominant axis for diagonal movement (more horizontal)', () => {
      // Bullet moving mostly right with some downward component
      const velocity: Vector2D = { x: 5, y: 2 };

      const normal = determineWallNormal(velocity);

      // Should treat as horizontal collision (vertical wall)
      expect(normal.x).toBeCloseTo(-1);
      expect(normal.y).toBeCloseTo(0);
    });

    it('should determine dominant axis for diagonal movement (more vertical)', () => {
      // Bullet moving mostly down with some rightward component
      const velocity: Vector2D = { x: 2, y: 5 };

      const normal = determineWallNormal(velocity);

      // Should treat as vertical collision (horizontal wall)
      expect(normal.x).toBeCloseTo(0);
      expect(normal.y).toBeCloseTo(-1);
    });
  });

  describe('applyBounce', () => {
    const TILE_SIZE = 40; // Using typical tile size

    it('should return reflected velocity and offset position', () => {
      const bulletX = 85;
      const bulletY = 100;
      const velocity: Vector2D = { x: 100, y: 0 };
      const bounceRemaining = 1;

      const result = applyBounce(
        bulletX,
        bulletY,
        velocity,
        bounceRemaining,
        TILE_SIZE
      );

      expect(result.shouldBounce).toBe(true);
      expect(result.newVelocity.x).toBeCloseTo(-100);
      expect(result.newVelocity.y).toBeCloseTo(0);
      expect(result.bounceRemaining).toBe(0);
    });

    it('should not bounce when bounceRemaining is 0', () => {
      const bulletX = 85;
      const bulletY = 100;
      const velocity: Vector2D = { x: 100, y: 0 };
      const bounceRemaining = 0;

      const result = applyBounce(
        bulletX,
        bulletY,
        velocity,
        bounceRemaining,
        TILE_SIZE
      );

      expect(result.shouldBounce).toBe(false);
    });

    it('should decrement bounceRemaining after bounce', () => {
      const bulletX = 85;
      const bulletY = 100;
      const velocity: Vector2D = { x: 100, y: 0 };
      const bounceRemaining = 3;

      const result = applyBounce(
        bulletX,
        bulletY,
        velocity,
        bounceRemaining,
        TILE_SIZE
      );

      expect(result.bounceRemaining).toBe(2);
    });

    it('should offset position away from wall to prevent re-collision', () => {
      const bulletX = 82; // Inside wall at grid position 2
      const bulletY = 100;
      const velocity: Vector2D = { x: 100, y: 0 }; // Moving right

      const result = applyBounce(
        bulletX,
        bulletY,
        velocity,
        1,
        TILE_SIZE
      );

      // Should be moved back outside the wall
      expect(result.newX).toBeLessThan(80); // Left edge of wall at grid 2
    });

    it('should handle diagonal velocity correctly', () => {
      const bulletX = 85;
      const bulletY = 100;
      const velocity: Vector2D = { x: 100, y: 50 }; // Mostly horizontal

      const result = applyBounce(
        bulletX,
        bulletY,
        velocity,
        1,
        TILE_SIZE
      );

      expect(result.shouldBounce).toBe(true);
      // Horizontal component should be reversed, vertical unchanged
      expect(result.newVelocity.x).toBeCloseTo(-100);
      expect(result.newVelocity.y).toBeCloseTo(50);
    });
  });
});
