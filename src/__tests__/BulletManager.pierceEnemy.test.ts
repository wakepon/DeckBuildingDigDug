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

describe('Pierce Enemy Feature', () => {
  describe('PlayerStats pierceEnemy upgrade', () => {
    let playerStats: PlayerStats;

    beforeEach(() => {
      playerStats = new PlayerStats();
    });

    it('should have pierceEnemyCount of 0 by default', () => {
      expect(playerStats.pierceEnemyCount).toBe(0);
    });

    it('should increase pierceEnemyCount by 2 when upgrade is applied', () => {
      playerStats.applyUpgrade('pierceEnemy');
      expect(playerStats.pierceEnemyCount).toBe(2);
    });

    it('should stack pierceEnemy upgrades', () => {
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.applyUpgrade('pierceEnemy');
      expect(playerStats.pierceEnemyCount).toBe(6);
    });

    it('should include pierceEnemy in acquired upgrades', () => {
      playerStats.applyUpgrade('pierceEnemy');
      expect(playerStats.acquiredUpgrades).toContain('pierceEnemy');
    });

    it('should reset pierceEnemyCount on reset()', () => {
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.reset();
      expect(playerStats.pierceEnemyCount).toBe(0);
    });

    it('should remove pierceEnemy upgrade correctly', () => {
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.applyUpgrade('pierceEnemy');
      expect(playerStats.pierceEnemyCount).toBe(4);

      playerStats.removeUpgrade('pierceEnemy');
      expect(playerStats.pierceEnemyCount).toBe(2);
    });
  });

  describe('Bullet pierceEnemyRemaining property', () => {
    it('should create bullet with pierceEnemyRemaining from constructor', () => {
      const bullet = new Bullet(
        100, 100, 1, 0,
        8,  // size
        0,  // penetration (walls)
        0,  // bounce
        2   // pierceEnemy
      );

      expect(bullet.pierceEnemyRemaining).toBe(2);
    });

    it('should create bullet with 0 pierceEnemyRemaining by default', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0);
      expect(bullet.pierceEnemyRemaining).toBe(0);
    });

    it('should have canPierceEnemy true when pierceEnemyRemaining > 0', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 1);
      expect(bullet.canPierceEnemy).toBe(true);
    });

    it('should have canPierceEnemy false when pierceEnemyRemaining is 0', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 0);
      expect(bullet.canPierceEnemy).toBe(false);
    });

    it('should decrement pierceEnemyRemaining correctly', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 3);
      expect(bullet.pierceEnemyRemaining).toBe(3);

      bullet.pierceEnemyRemaining--;
      expect(bullet.pierceEnemyRemaining).toBe(2);

      bullet.pierceEnemyRemaining--;
      expect(bullet.pierceEnemyRemaining).toBe(1);

      bullet.pierceEnemyRemaining--;
      expect(bullet.pierceEnemyRemaining).toBe(0);
      expect(bullet.canPierceEnemy).toBe(false);
    });
  });

  describe('Bullet creation with PlayerStats pierceEnemy', () => {
    let playerStats: PlayerStats;

    beforeEach(() => {
      playerStats = new PlayerStats();
    });

    it('should create bullet with pierceEnemyCount from PlayerStats', () => {
      playerStats.applyUpgrade('pierceEnemy');
      playerStats.applyUpgrade('pierceEnemy');

      const bullet = new Bullet(
        100, 100, 1, 0,
        playerStats.bulletSize,
        playerStats.penetrationCount,
        playerStats.bounceCount,
        playerStats.pierceEnemyCount
      );

      expect(bullet.pierceEnemyRemaining).toBe(4);
    });

    it('should create bullet with 0 pierceEnemy when no upgrade', () => {
      const bullet = new Bullet(
        100, 100, 1, 0,
        playerStats.bulletSize,
        playerStats.penetrationCount,
        playerStats.bounceCount,
        playerStats.pierceEnemyCount
      );

      expect(bullet.pierceEnemyRemaining).toBe(0);
    });
  });

  describe('Pierce enemy behavior on collision', () => {
    it('should track enemies already hit to prevent double damage', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 2);
      const enemyId = 'enemy-1';

      expect(bullet.hasHitEnemy(enemyId)).toBe(false);

      bullet.recordEnemyHit(enemyId);
      expect(bullet.hasHitEnemy(enemyId)).toBe(true);

      // Different enemy should not be tracked
      expect(bullet.hasHitEnemy('enemy-2')).toBe(false);
    });

    it('should not decrement pierce when hitting same enemy again', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 2);
      const enemyId = 'enemy-1';

      // First hit
      bullet.recordEnemyHit(enemyId);
      bullet.pierceEnemyRemaining--;
      expect(bullet.pierceEnemyRemaining).toBe(1);

      // Bullet continues and hits same enemy again - should be ignored
      expect(bullet.hasHitEnemy(enemyId)).toBe(true);
      // pierceEnemyRemaining should not change
      expect(bullet.pierceEnemyRemaining).toBe(1);
    });
  });

  describe('Edge cases', () => {
    it('should handle bullet with only pierceEnemy (no penetration or bounce)', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 0, 0, 3);

      expect(bullet.penetrationRemaining).toBe(0);
      expect(bullet.bounceRemaining).toBe(0);
      expect(bullet.pierceEnemyRemaining).toBe(3);
      expect(bullet.canPierceEnemy).toBe(true);
    });

    it('should handle bullet with all abilities (penetration, bounce, and pierceEnemy)', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 2, 1, 3);

      expect(bullet.penetrationRemaining).toBe(2);
      expect(bullet.bounceRemaining).toBe(1);
      expect(bullet.pierceEnemyRemaining).toBe(3);
    });

    it('should handle bullet with zero pierceEnemy', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 2, 1, 0);

      expect(bullet.pierceEnemyRemaining).toBe(0);
      expect(bullet.canPierceEnemy).toBe(false);
    });

    it('should maintain separate counters for walls and enemies', () => {
      const bullet = new Bullet(100, 100, 1, 0, 8, 2, 0, 3);

      // Wall penetration
      bullet.penetrationRemaining--;
      expect(bullet.penetrationRemaining).toBe(1);
      expect(bullet.pierceEnemyRemaining).toBe(3); // Unchanged

      // Enemy pierce
      bullet.pierceEnemyRemaining--;
      expect(bullet.penetrationRemaining).toBe(1); // Unchanged
      expect(bullet.pierceEnemyRemaining).toBe(2);
    });
  });
});
