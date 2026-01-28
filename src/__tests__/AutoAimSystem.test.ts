import { describe, it, expect, beforeEach } from 'vitest';
import { AutoAimSystem, Target, TargetType } from '../AutoAimSystem';
import {
  AUTO_AIM_CONE_ANGLE,
  AUTO_AIM_MAX_RANGE,
} from '../constants';

describe('AutoAimSystem', () => {
  let autoAimSystem: AutoAimSystem;

  beforeEach(() => {
    autoAimSystem = new AutoAimSystem();
  });

  describe('constructor', () => {
    it('should be disabled by default', () => {
      expect(autoAimSystem.isEnabled).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('should enable auto-aim when called with true', () => {
      autoAimSystem.setEnabled(true);
      expect(autoAimSystem.isEnabled).toBe(true);
    });

    it('should disable auto-aim when called with false', () => {
      autoAimSystem.setEnabled(true);
      autoAimSystem.setEnabled(false);
      expect(autoAimSystem.isEnabled).toBe(false);
    });
  });

  describe('toggle', () => {
    it('should toggle from disabled to enabled', () => {
      const result = autoAimSystem.toggle();
      expect(result).toBe(true);
      expect(autoAimSystem.isEnabled).toBe(true);
    });

    it('should toggle from enabled to disabled', () => {
      autoAimSystem.setEnabled(true);
      const result = autoAimSystem.toggle();
      expect(result).toBe(false);
      expect(autoAimSystem.isEnabled).toBe(false);
    });
  });

  describe('isInCone', () => {
    // Player at origin, moving right (direction = {x: 1, y: 0})
    it('should return true for target directly in front', () => {
      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        100, 0          // target position (directly right)
      );
      expect(result).toBe(true);
    });

    it('should return true for target within cone angle', () => {
      // 30 degrees is within the 60 degree cone (30 each side)
      const angle = 25 * Math.PI / 180; // 25 degrees
      const distance = 100;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        targetX, targetY // target position
      );
      expect(result).toBe(true);
    });

    it('should return false for target outside cone angle', () => {
      // 45 degrees is outside the 30-degree half-cone
      const angle = 45 * Math.PI / 180;
      const distance = 100;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        targetX, targetY // target position
      );
      expect(result).toBe(false);
    });

    it('should return false for target behind player', () => {
      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        -100, 0         // target position (behind)
      );
      expect(result).toBe(false);
    });

    it('should return false for target beyond max range', () => {
      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        AUTO_AIM_MAX_RANGE + 100, 0 // target position (too far)
      );
      expect(result).toBe(false);
    });

    it('should return true for target just within max range', () => {
      const result = autoAimSystem.isInCone(
        0, 0,           // player position
        1, 0,           // movement direction (right)
        AUTO_AIM_MAX_RANGE - 10, 0 // target position (just within range)
      );
      expect(result).toBe(true);
    });

    it('should handle diagonal movement direction', () => {
      // Moving diagonally (normalized)
      const dirX = 1 / Math.sqrt(2);
      const dirY = 1 / Math.sqrt(2);

      // Target directly in diagonal direction
      const result = autoAimSystem.isInCone(
        0, 0,
        dirX, dirY,
        100, 100 // Directly along diagonal
      );
      expect(result).toBe(true);
    });

    it('should return false when movement direction is zero', () => {
      const result = autoAimSystem.isInCone(
        0, 0,
        0, 0,           // no movement
        100, 0
      );
      expect(result).toBe(false);
    });
  });

  describe('findBestTarget', () => {
    it('should return null when auto-aim is disabled', () => {
      const targets: Target[] = [
        { x: 100, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,           // player position
        1, 0,           // movement direction
        targets
      );

      expect(result).toBeNull();
    });

    it('should return null when no targets are in cone', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: -100, y: 0, type: 'enemy' as TargetType } // behind player
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        targets
      );

      expect(result).toBeNull();
    });

    it('should return closest enemy when multiple enemies in cone', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 200, y: 0, type: 'enemy' as TargetType },
        { x: 100, y: 0, type: 'enemy' as TargetType }, // closest
        { x: 150, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        targets
      );

      expect(result).not.toBeNull();
      expect(result!.x).toBe(100);
    });

    it('should prioritize enemy over wall at same distance', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 100, y: 0, type: 'wall' as TargetType },
        { x: 100, y: 10, type: 'enemy' as TargetType } // slightly further but enemy
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        targets
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('enemy');
    });

    it('should target wall when no enemies in cone', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 100, y: 0, type: 'wall' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        targets
      );

      expect(result).not.toBeNull();
      expect(result!.type).toBe('wall');
    });

    it('should return null when targets array is empty', () => {
      autoAimSystem.setEnabled(true);
      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        []
      );

      expect(result).toBeNull();
    });

    it('should return null when movement direction is zero', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 100, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        0, 0, // no movement
        targets
      );

      expect(result).toBeNull();
    });
  });

  describe('calculateAimDirection', () => {
    it('should return normalized direction to target', () => {
      const result = autoAimSystem.calculateAimDirection(
        0, 0,           // player position
        100, 0          // target position
      );

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should handle diagonal targets', () => {
      const result = autoAimSystem.calculateAimDirection(
        0, 0,
        100, 100
      );

      expect(result.x).toBeCloseTo(1 / Math.sqrt(2), 5);
      expect(result.y).toBeCloseTo(1 / Math.sqrt(2), 5);
    });

    it('should return zero vector when player is at target position', () => {
      const result = autoAimSystem.calculateAimDirection(
        100, 100,
        100, 100
      );

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const result = autoAimSystem.calculateAimDirection(
        0, 0,
        -100, 0
      );

      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
    });
  });

  describe('getAimDirection - integration', () => {
    it('should return movement direction when auto-aim is disabled', () => {
      const targets: Target[] = [
        { x: 100, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.getAimDirection(
        0, 0,           // player position
        0.5, 0.5,       // movement direction
        targets
      );

      // Should return normalized movement direction
      expect(result.x).toBeCloseTo(1 / Math.sqrt(2), 5);
      expect(result.y).toBeCloseTo(1 / Math.sqrt(2), 5);
    });

    it('should return direction to target when auto-aim finds target', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 100, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.getAimDirection(
        0, 0,
        1, 0, // moving right
        targets
      );

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should return movement direction when no target found', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: -100, y: 0, type: 'enemy' as TargetType } // behind player
      ];

      const result = autoAimSystem.getAimDirection(
        0, 0,
        1, 0, // moving right
        targets
      );

      // No target in cone, should return movement direction
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should return zero vector when movement is zero and no target', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [];

      const result = autoAimSystem.getAimDirection(
        0, 0,
        0, 0, // no movement
        targets
      );

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very small movement directions', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 100, y: 0, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.getAimDirection(
        0, 0,
        0.001, 0, // very small movement
        targets
      );

      // Should still work with very small movement
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
    });

    it('should handle targets at exact cone boundary', () => {
      autoAimSystem.setEnabled(true);
      // Exactly at 30 degrees (boundary of 60 degree cone)
      const angle = AUTO_AIM_CONE_ANGLE / 2;
      const distance = 100;
      const targets: Target[] = [
        { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        0, 0,
        1, 0,
        targets
      );

      // Should be included (boundary is inclusive)
      expect(result).not.toBeNull();
    });

    it('should handle player not at origin', () => {
      autoAimSystem.setEnabled(true);
      const targets: Target[] = [
        { x: 200, y: 200, type: 'enemy' as TargetType }
      ];

      const result = autoAimSystem.findBestTarget(
        100, 200, // player at (100, 200)
        1, 0,     // moving right
        targets
      );

      // Target is at (200, 200), 100 pixels to the right of player
      expect(result).not.toBeNull();
      expect(result!.x).toBe(200);
    });
  });
});
