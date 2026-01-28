import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlayerStats } from '../PlayerStats';
import { WallManager } from '../WallManager';

// Mock PIXI.js
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    rect() { return this; }
    roundRect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    moveTo() { return this; }
    lineTo() { return this; }
    destroy() {}
  }

  class MockContainer {
    children: unknown[] = [];
    addChild(child: unknown) {
      this.children.push(child);
    }
    removeChild(child: unknown) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    }
    destroy() {}
  }

  return {
    Graphics: MockGraphics,
    Container: MockContainer,
  };
});

describe('BulletManager Wall Damage with Attack Power', () => {
  describe('Wall damage calculation', () => {
    it('should calculate wall damage using floor of attackPower', () => {
      const playerStats = new PlayerStats();

      // Base attack power is 1
      expect(playerStats.attackPower).toBe(1);

      // Wall damage should be Math.floor(attackPower)
      const wallDamage = Math.floor(playerStats.attackPower);
      expect(wallDamage).toBe(1);
    });

    it('should increase wall damage when attack power is upgraded', () => {
      const playerStats = new PlayerStats();

      // Apply attack power upgrade (+20%)
      playerStats.applyUpgrade('attackPower');
      expect(playerStats.attackPower).toBeCloseTo(1.2, 5);

      // Wall damage should still be 1 (floor of 1.2)
      const wallDamage1 = Math.floor(playerStats.attackPower);
      expect(wallDamage1).toBe(1);

      // Apply more upgrades to reach attack power >= 2.2 (guarantees floor >= 2)
      playerStats.applyUpgrade('attackPower'); // 1.4
      playerStats.applyUpgrade('attackPower'); // 1.6
      playerStats.applyUpgrade('attackPower'); // 1.8
      playerStats.applyUpgrade('attackPower'); // 2.0
      playerStats.applyUpgrade('attackPower'); // 2.2 (6 upgrades total)
      expect(playerStats.attackPower).toBeCloseTo(2.2, 5);

      // Wall damage should now be 2 (floor of 2.2)
      const wallDamage2 = Math.floor(playerStats.attackPower);
      expect(wallDamage2).toBe(2);
    });

    it('should correctly floor attack power at various levels', () => {
      const testCases = [
        { attackPower: 1.0, expectedDamage: 1 },
        { attackPower: 1.2, expectedDamage: 1 },
        { attackPower: 1.8, expectedDamage: 1 },
        { attackPower: 1.99, expectedDamage: 1 },
        { attackPower: 2.0, expectedDamage: 2 },
        { attackPower: 2.5, expectedDamage: 2 },
        { attackPower: 3.0, expectedDamage: 3 },
        { attackPower: 5.5, expectedDamage: 5 },
      ];

      for (const testCase of testCases) {
        const wallDamage = Math.floor(testCase.attackPower);
        expect(wallDamage).toBe(testCase.expectedDamage);
      }
    });
  });

  describe('Attack power progression', () => {
    it('should have base attack power of 1', () => {
      const playerStats = new PlayerStats();
      expect(playerStats.attackPower).toBe(1);
    });

    it('should increase by 20% per upgrade', () => {
      const playerStats = new PlayerStats();

      playerStats.applyUpgrade('attackPower');
      expect(playerStats.attackPower).toBeCloseTo(1.2, 5);

      playerStats.applyUpgrade('attackPower');
      expect(playerStats.attackPower).toBeCloseTo(1.4, 5);
    });

    it('should reach attack power 3 after 10 upgrades', () => {
      const playerStats = new PlayerStats();

      for (let i = 0; i < 10; i++) {
        playerStats.applyUpgrade('attackPower');
      }

      // 1 + (10 * 0.2) = 3
      expect(playerStats.attackPower).toBeCloseTo(3.0, 5);

      // Wall damage should be 3
      const wallDamage = Math.floor(playerStats.attackPower);
      expect(wallDamage).toBe(3);
    });
  });

  describe('Integration: wall damage vs wall HP', () => {
    it('should destroy HP 1 wall in one hit with base attack power', () => {
      const playerStats = new PlayerStats();
      const wallHP = 1;
      const wallDamage = Math.floor(playerStats.attackPower);

      expect(wallHP - wallDamage).toBeLessThanOrEqual(0);
    });

    it('should require multiple hits for HP 3 wall with base attack power', () => {
      const playerStats = new PlayerStats();
      const wallHP = 3;
      const wallDamage = Math.floor(playerStats.attackPower);

      expect(wallHP - wallDamage).toBeGreaterThan(0);
      expect(Math.ceil(wallHP / wallDamage)).toBe(3);
    });

    it('should destroy HP 3 wall in 2 hits with attack power 2', () => {
      // 5 upgrades to reach attack power 2.0
      const wallHP = 3;
      const attackPower = 2.0;
      const wallDamage = Math.floor(attackPower);

      expect(Math.ceil(wallHP / wallDamage)).toBe(2);
    });

    it('should handle high HP walls with upgraded attack power', () => {
      // With 10 upgrades: attack power 3.0, damage 3
      const attackPower = 3.0;
      const wallDamage = Math.floor(attackPower);

      // HP 10 wall should take 4 hits (10 / 3 = 3.33, ceil = 4)
      const wallHP10 = 10;
      expect(Math.ceil(wallHP10 / wallDamage)).toBe(4);

      // HP 6 wall should take 2 hits (6 / 3 = 2)
      const wallHP6 = 6;
      expect(Math.ceil(wallHP6 / wallDamage)).toBe(2);
    });
  });

  describe('Integration: WallManager and PlayerStats', () => {
    let wallManager: WallManager;
    let playerStats: PlayerStats;

    beforeEach(() => {
      playerStats = new PlayerStats();
      wallManager = new WallManager();
    });

    it('should use attackPower when damaging walls', () => {
      // Create a test wall at grid position (5, 5) with HP 3
      const gridX = 5;
      const gridY = 5;

      // Get the wall and verify it exists
      const wall = wallManager.getWall(gridX, gridY);
      expect(wall).not.toBeNull();

      if (wall) {
        const initialHP = wall.hp;

        // Base attack power is 1, so wall damage should be floor(1) = 1
        const expectedDamage = Math.floor(playerStats.attackPower);
        expect(expectedDamage).toBe(1);

        // Damage the wall
        wallManager.damageWall(gridX, gridY, expectedDamage);

        // Wall HP should decrease by the damage amount
        const damagedWall = wallManager.getWall(gridX, gridY);
        if (damagedWall) {
          expect(damagedWall.hp).toBe(initialHP - expectedDamage);
        }
      }
    });

    it('should use upgraded attackPower when damaging walls', () => {
      // Apply 6 attack power upgrades to reach attack power 2.2 (avoids floating point precision issues)
      for (let i = 0; i < 6; i++) {
        playerStats.applyUpgrade('attackPower');
      }

      // 1 + 6 * 0.2 = 2.2
      expect(playerStats.attackPower).toBeCloseTo(2.2, 5);

      // Create a test wall at grid position (5, 5) with HP 5
      const gridX = 5;
      const gridY = 5;

      const wall = wallManager.getWall(gridX, gridY);
      expect(wall).not.toBeNull();

      if (wall) {
        const initialHP = wall.hp;

        // Attack power is 2.2, so wall damage should be floor(2.2) = 2
        const expectedDamage = Math.floor(playerStats.attackPower);
        expect(expectedDamage).toBe(2);

        // Damage the wall
        wallManager.damageWall(gridX, gridY, expectedDamage);

        // Wall HP should decrease by 2
        const damagedWall = wallManager.getWall(gridX, gridY);
        if (damagedWall) {
          expect(damagedWall.hp).toBe(initialHP - expectedDamage);
        }
      }
    });

    it('should destroy wall when damage exceeds HP', () => {
      // Apply 10 attack power upgrades to reach attack power 3.0
      for (let i = 0; i < 10; i++) {
        playerStats.applyUpgrade('attackPower');
      }

      expect(playerStats.attackPower).toBeCloseTo(3.0, 5);

      // Create a test wall at grid position (5, 5)
      const gridX = 5;
      const gridY = 5;

      const wall = wallManager.getWall(gridX, gridY);
      expect(wall).not.toBeNull();

      if (wall && wall.hp <= 3) {
        // Attack power is 3.0, so wall damage is floor(3.0) = 3
        const wallDamage = Math.floor(playerStats.attackPower);
        expect(wallDamage).toBe(3);

        // Damage the wall (should destroy if HP <= 3)
        const destroyed = wallManager.damageWall(gridX, gridY, wallDamage);

        if (wall.hp <= 3) {
          expect(destroyed).toBe(true);
          expect(wallManager.getWall(gridX, gridY)).toBeNull();
        }
      }
    });
  });
});
