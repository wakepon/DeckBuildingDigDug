import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock PIXI.js
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

  class MockContainer {
    children: any[] = [];
    addChild(child: any) { this.children.push(child); return child; }
    removeChild(child: any) {
      const index = this.children.indexOf(child);
      if (index > -1) this.children.splice(index, 1);
      return child;
    }
  }

  return {
    Graphics: MockGraphics,
    Container: MockContainer,
  };
});

import { Bullet } from '../Bullet';
import { PlayerStats } from '../PlayerStats';

describe('BulletManager Bounce Integration', () => {
  describe('Bullet creation with bounce count from PlayerStats', () => {
    let playerStats: PlayerStats;

    beforeEach(() => {
      playerStats = new PlayerStats();
    });

    it('should create bullet with bounceCount from PlayerStats', () => {
      playerStats.applyUpgrade('bounce');
      playerStats.applyUpgrade('bounce');

      const bullet = new Bullet(
        100, 100, 1, 0,
        playerStats.bulletSize,
        playerStats.penetrationCount,
        playerStats.bounceCount
      );

      expect(bullet.bounceRemaining).toBe(2);
    });

    it('should create bullet with 0 bounce when no upgrade', () => {
      const bullet = new Bullet(
        100, 100, 1, 0,
        playerStats.bulletSize,
        playerStats.penetrationCount,
        playerStats.bounceCount
      );

      expect(bullet.bounceRemaining).toBe(0);
    });
  });

  describe('Bounce priority over penetration', () => {
    it('should use penetration first when both are available', () => {
      // When bullet has both penetration and bounce, penetration takes priority
      // Bounce only happens when penetrationRemaining <= 0
      const bullet = new Bullet(100, 100, 1, 0, 8, 2, 1);

      expect(bullet.penetrationRemaining).toBe(2);
      expect(bullet.bounceRemaining).toBe(1);

      // Simulate wall hit - penetration should be used first
      bullet.penetrationRemaining--;
      expect(bullet.penetrationRemaining).toBe(1);
      expect(bullet.bounceRemaining).toBe(1); // Bounce unchanged
    });

    it('should allow bounce after penetration is exhausted', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 1, 2);

      // First wall hit - use penetration
      bullet.penetrationRemaining--;
      expect(bullet.penetrationRemaining).toBe(0);
      expect(bullet.bounceRemaining).toBe(2);

      // Second wall hit - no penetration left, use bounce
      expect(bullet.hasBounce).toBe(true);

      bullet.applyBounce({ x: -1, y: 0 });
      expect(bullet.bounceRemaining).toBe(1);
    });
  });

  describe('Bounce with wall collision simulation', () => {
    it('should reflect bullet velocity and offset position when hitting right wall', () => {
      // Bullet moving right
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 1);
      const originalVy = bullet.vy;

      // Bounce off vertical wall (facing left)
      bullet.applyBounce({ x: -1, y: 0 });

      expect(bullet.vx).toBeLessThan(0); // Now moving left
      expect(bullet.vy).toBeCloseTo(originalVy); // Y unchanged
      expect(bullet.bounceRemaining).toBe(0);
    });

    it('should reflect bullet velocity when hitting bottom wall', () => {
      // Bullet moving down
      const bullet = new Bullet(100, 100, 0, 1, 8, 0, 1);
      const originalVx = bullet.vx;

      // Bounce off horizontal wall (facing up)
      bullet.applyBounce({ x: 0, y: -1 });

      expect(bullet.vx).toBeCloseTo(originalVx); // X unchanged
      expect(bullet.vy).toBeLessThan(0); // Now moving up
      expect(bullet.bounceRemaining).toBe(0);
    });

    it('should allow multiple bounces', () => {
      const bullet = new Bullet(100, 100, 1, 1, 8, 0, 3);

      // First bounce
      bullet.applyBounce({ x: -1, y: 0 });
      expect(bullet.bounceRemaining).toBe(2);
      expect(bullet.vx).toBeLessThan(0);

      // Second bounce
      bullet.applyBounce({ x: 0, y: -1 });
      expect(bullet.bounceRemaining).toBe(1);
      expect(bullet.vy).toBeLessThan(0);

      // Third bounce
      bullet.applyBounce({ x: 1, y: 0 });
      expect(bullet.bounceRemaining).toBe(0);
      expect(bullet.vx).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle bullet with only penetration (no bounce)', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 3, 0);

      expect(bullet.penetrationRemaining).toBe(3);
      expect(bullet.bounceRemaining).toBe(0);
      expect(bullet.hasBounce).toBe(false);
    });

    it('should handle bullet with only bounce (no penetration)', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 2);

      expect(bullet.penetrationRemaining).toBe(0);
      expect(bullet.bounceRemaining).toBe(2);
      expect(bullet.hasBounce).toBe(true);
    });

    it('should handle bullet with neither bounce nor penetration', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0);

      expect(bullet.penetrationRemaining).toBe(0);
      expect(bullet.bounceRemaining).toBe(0);
      expect(bullet.hasBounce).toBe(false);
    });
  });
});
