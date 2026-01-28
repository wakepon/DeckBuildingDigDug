import { describe, it, expect, vi } from 'vitest';

// Mock PIXI.js Graphics
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    fill() { return this; }
    stroke() { return this; }
    destroy() {}
  }

  return {
    Graphics: MockGraphics,
  };
});

import { Bullet } from '../Bullet';

describe('Bullet', () => {
  describe('bounceRemaining property', () => {
    it('should initialize bounceRemaining to 0 by default', () => {
      const bullet = new Bullet(100, 100, 1, 0);
      expect(bullet.bounceRemaining).toBe(0);
    });

    it('should accept bounceRemaining as constructor parameter', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 3);
      expect(bullet.bounceRemaining).toBe(3);
    });

    it('should allow bounceRemaining to be modified', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 2);
      expect(bullet.bounceRemaining).toBe(2);

      bullet.bounceRemaining = 1;
      expect(bullet.bounceRemaining).toBe(1);
    });
  });

  describe('applyBounce method', () => {
    it('should exist on Bullet class', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      expect(typeof bullet.applyBounce).toBe('function');
    });

    it('should reverse horizontal velocity when bouncing off vertical wall', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      const originalVx = bullet.vx;
      const originalVy = bullet.vy;

      // Simulate bouncing off a wall to the right
      bullet.applyBounce({ x: -1, y: 0 }); // Normal pointing left

      expect(bullet.vx).toBeCloseTo(-originalVx);
      expect(bullet.vy).toBeCloseTo(originalVy);
    });

    it('should reverse vertical velocity when bouncing off horizontal wall', () => {
      const bullet = new Bullet(100, 100, 0, 1, 8, 0, 1);
      const originalVx = bullet.vx;
      const originalVy = bullet.vy;

      // Simulate bouncing off a wall below
      bullet.applyBounce({ x: 0, y: -1 }); // Normal pointing up

      expect(bullet.vx).toBeCloseTo(originalVx);
      expect(bullet.vy).toBeCloseTo(-originalVy);
    });

    it('should decrement bounceRemaining after bounce', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 3);
      expect(bullet.bounceRemaining).toBe(3);

      bullet.applyBounce({ x: -1, y: 0 });
      expect(bullet.bounceRemaining).toBe(2);

      bullet.applyBounce({ x: -1, y: 0 });
      expect(bullet.bounceRemaining).toBe(1);
    });

    it('should preserve velocity magnitude after bounce', () => {
      const bullet = new Bullet(100, 100, 3, 4, 8, 0, 1); // 3-4-5 triangle

      const originalMagnitude = Math.sqrt(bullet.vx ** 2 + bullet.vy ** 2);

      bullet.applyBounce({ x: -1, y: 0 });

      const newMagnitude = Math.sqrt(bullet.vx ** 2 + bullet.vy ** 2);
      expect(newMagnitude).toBeCloseTo(originalMagnitude);
    });
  });

  describe('setPosition method', () => {
    it('should exist on Bullet class', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      expect(typeof bullet.setPosition).toBe('function');
    });

    it('should update bullet position', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      expect(bullet.x).toBe(100);
      expect(bullet.y).toBe(100);

      bullet.setPosition(200, 150);
      expect(bullet.x).toBe(200);
      expect(bullet.y).toBe(150);
    });
  });

  describe('hasBounce property', () => {
    it('should return false when bounceRemaining is 0', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0);
      expect(bullet.hasBounce).toBe(false);
    });

    it('should return true when bounceRemaining is greater than 0', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      expect(bullet.hasBounce).toBe(true);
    });
  });

});
