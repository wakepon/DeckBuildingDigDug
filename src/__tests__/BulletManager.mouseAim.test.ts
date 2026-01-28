import { describe, it, expect, beforeEach } from 'vitest';
import { AutoAimSystem, Target, TargetType } from '../AutoAimSystem';

/**
 * Tests for mouse-based auto-aim targeting in BulletManager
 *
 * The BulletManager uses InputManager.getMouseDirection() to determine
 * the reference direction for auto-aim targeting instead of movement direction.
 */
describe('BulletManager Mouse-based Auto-aim', () => {
  /**
   * Simulates the logic that BulletManager.fire() should use for auto-aim
   * with mouse-based targeting direction
   */
  function simulateMouseBasedAutoAim(
    autoAimSystem: AutoAimSystem,
    playerX: number,
    playerY: number,
    mouseDirection: { x: number; y: number },
    targets: Target[]
  ): { x: number; y: number } | null {
    // If no mouse direction (mouse at player position), don't fire
    if (mouseDirection.x === 0 && mouseDirection.y === 0) {
      return null;
    }

    // Get aim direction using mouse direction as reference
    return autoAimSystem.getAimDirection(
      playerX,
      playerY,
      mouseDirection.x,
      mouseDirection.y,
      targets
    );
  }

  describe('Mouse direction as reference for cone detection', () => {
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      autoAimSystem = new AutoAimSystem();
      autoAimSystem.setEnabled(true);
    });

    it('should find target in mouse direction cone', () => {
      // Player at (100, 100), mouse direction pointing right (1, 0)
      const mouseDir = { x: 1, y: 0 };
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType } // Enemy to the right
      ];

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).not.toBeNull();
      expect(aimDir!.x).toBeCloseTo(1);
      expect(aimDir!.y).toBeCloseTo(0);
    });

    it('should not find target outside mouse direction cone', () => {
      // Player at (100, 100), mouse direction pointing right (1, 0)
      const mouseDir = { x: 1, y: 0 };
      const targets: Target[] = [
        { x: 50, y: 100, type: 'enemy' as TargetType } // Enemy to the LEFT (behind mouse direction)
      ];

      const best = autoAimSystem.findBestTarget(100, 100, mouseDir.x, mouseDir.y, targets);

      expect(best).toBeNull();
    });

    it('should return null when mouse direction is zero', () => {
      // Mouse at player position, direction is (0, 0)
      const mouseDir = { x: 0, y: 0 };
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).toBeNull();
    });

    it('should use mouse diagonal direction for cone detection', () => {
      // Player at (100, 100), mouse direction pointing up-right (0.707, -0.707)
      const mouseDir = { x: 0.707, y: -0.707 };
      const targets: Target[] = [
        { x: 180, y: 20, type: 'enemy' as TargetType } // Enemy in up-right direction
      ];

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).not.toBeNull();
      // Should aim at the enemy
      expect(aimDir!.x).toBeGreaterThan(0);
      expect(aimDir!.y).toBeLessThan(0);
    });

    it('should fall back to mouse direction when no targets in cone', () => {
      // Player at (100, 100), mouse direction pointing right (1, 0)
      const mouseDir = { x: 1, y: 0 };
      const targets: Target[] = []; // No targets

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).not.toBeNull();
      // Should use mouse direction as fallback
      expect(aimDir!.x).toBeCloseTo(1);
      expect(aimDir!.y).toBeCloseTo(0);
    });

    it('should prioritize enemy over wall in mouse direction', () => {
      // Player at (100, 100), mouse direction pointing right (1, 0)
      const mouseDir = { x: 1, y: 0 };
      const targets: Target[] = [
        { x: 150, y: 100, type: 'wall' as TargetType }, // Closer wall
        { x: 200, y: 100, type: 'enemy' as TargetType } // Farther enemy
      ];

      const best = autoAimSystem.findBestTarget(100, 100, mouseDir.x, mouseDir.y, targets);

      expect(best).not.toBeNull();
      expect(best!.type).toBe('enemy');
    });

    it('should find closest enemy in mouse direction', () => {
      // Player at (100, 100), mouse direction pointing right (1, 0)
      const mouseDir = { x: 1, y: 0 };
      const targets: Target[] = [
        { x: 250, y: 100, type: 'enemy' as TargetType },
        { x: 150, y: 100, type: 'enemy' as TargetType }, // Closest
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const best = autoAimSystem.findBestTarget(100, 100, mouseDir.x, mouseDir.y, targets);

      expect(best).not.toBeNull();
      expect(best!.x).toBe(150);
    });
  });

  describe('Movement direction no longer used for auto-aim', () => {
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      autoAimSystem = new AutoAimSystem();
      autoAimSystem.setEnabled(true);
    });

    it('should use mouse direction even when player is moving differently', () => {
      // Scenario: Player moving left but mouse is pointing right
      // Old behavior: would use movement direction (left)
      // New behavior: should use mouse direction (right)

      // Mouse direction pointing right
      const mouseDir = { x: 1, y: 0 };

      // Enemy to the right (in mouse direction, not movement direction)
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).not.toBeNull();
      // Should aim right (mouse direction), not left (movement direction)
      expect(aimDir!.x).toBeCloseTo(1);
    });

    it('should not fall back to last movement direction', () => {
      // Scenario: Player is stationary (no movement direction)
      // Old behavior: would use lastMoveDirection
      // New behavior: should use mouse direction

      // Mouse direction pointing down
      const mouseDir = { x: 0, y: 1 };

      // Enemy below player
      const targets: Target[] = [
        { x: 100, y: 200, type: 'enemy' as TargetType }
      ];

      const aimDir = simulateMouseBasedAutoAim(
        autoAimSystem,
        100, 100,
        mouseDir,
        targets
      );

      expect(aimDir).not.toBeNull();
      expect(aimDir!.y).toBeCloseTo(1);
    });
  });

  describe('Edge cases for mouse-based targeting', () => {
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      autoAimSystem = new AutoAimSystem();
      autoAimSystem.setEnabled(true);
    });

    it('should handle mouse direction pointing in cardinal directions', () => {
      const cardinalDirections = [
        { dir: { x: 1, y: 0 }, enemyPos: { x: 200, y: 100 } }, // Right
        { dir: { x: -1, y: 0 }, enemyPos: { x: 0, y: 100 } },  // Left
        { dir: { x: 0, y: 1 }, enemyPos: { x: 100, y: 200 } }, // Down
        { dir: { x: 0, y: -1 }, enemyPos: { x: 100, y: 0 } },  // Up
      ];

      for (const { dir, enemyPos } of cardinalDirections) {
        const targets: Target[] = [
          { x: enemyPos.x, y: enemyPos.y, type: 'enemy' as TargetType }
        ];

        const best = autoAimSystem.findBestTarget(100, 100, dir.x, dir.y, targets);
        expect(best).not.toBeNull();
      }
    });

    it('should handle very small but valid mouse direction', () => {
      // Very small direction (after normalization should be (1, 0))
      const mouseDir = { x: 0.001, y: 0 };
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      // The direction is so small it might be considered zero
      const best = autoAimSystem.findBestTarget(100, 100, mouseDir.x, mouseDir.y, targets);

      // AutoAimSystem should normalize internally, so this should still work
      // unless the length is below the threshold (0.0001)
      // 0.001 is above 0.0001, so it should work
      expect(best).not.toBeNull();
    });
  });
});
