import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats, UPGRADE_DATA } from '../PlayerStats';
import {
  MULTI_WAY_SHOT_ANGLE_SPREAD,
  MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS,
  MULTI_WAY_SHOT_BULLET_COUNTS,
} from '../constants';
import { calculateMultiWayShotDirections } from '../multiWayShotUtils';

describe('Multi-Way Shot Damage System', () => {
  describe('Constants', () => {
    describe('MULTI_WAY_SHOT_ANGLE_SPREAD', () => {
      it('should be 20 degrees in radians', () => {
        const expectedRadians = (20 * Math.PI) / 180;
        expect(MULTI_WAY_SHOT_ANGLE_SPREAD).toBeCloseTo(expectedRadians, 5);
      });
    });

    describe('MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS', () => {
      it('should be defined', () => {
        expect(MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS).toBeDefined();
      });

      it('should have multiplier 1.0 for level 1', () => {
        expect(MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[1]).toBe(1.0);
      });

      it('should have multiplier 0.5 for level 2', () => {
        expect(MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[2]).toBe(0.5);
      });

      it('should have multiplier 0.4 for level 3', () => {
        expect(MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[3]).toBe(0.4);
      });
    });

    describe('MULTI_WAY_SHOT_BULLET_COUNTS', () => {
      it('should be defined', () => {
        expect(MULTI_WAY_SHOT_BULLET_COUNTS).toBeDefined();
      });

      it('should have 1 bullet for level 1', () => {
        expect(MULTI_WAY_SHOT_BULLET_COUNTS[1]).toBe(1);
      });

      it('should have 3 bullets for level 2', () => {
        expect(MULTI_WAY_SHOT_BULLET_COUNTS[2]).toBe(3);
      });

      it('should have 5 bullets for level 3', () => {
        expect(MULTI_WAY_SHOT_BULLET_COUNTS[3]).toBe(5);
      });
    });
  });

  describe('UPGRADE_DATA.multiWayShot', () => {
    it('should have maxLevel of 2 (2 upgrades to reach level 3)', () => {
      expect(UPGRADE_DATA.multiWayShot.maxLevel).toBe(2);
    });

    it('should have updated description mentioning damage reduction', () => {
      expect(UPGRADE_DATA.multiWayShot.description).toBe('3/5方向に発射 (威力減少)');
    });
  });

  describe('PlayerStats getters', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    describe('multiWayShotDamageMultiplier', () => {
      it('should return 1.0 at level 1 (no upgrades)', () => {
        expect(stats.multiWayShotDamageMultiplier).toBe(1.0);
      });

      it('should return 0.5 at level 2 (1 upgrade)', () => {
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotDamageMultiplier).toBe(0.5);
      });

      it('should return 0.4 at level 3 (2 upgrades)', () => {
        stats.applyUpgrade('multiWayShot');
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotDamageMultiplier).toBe(0.4);
      });

      it('should reset to 1.0 after reset()', () => {
        stats.applyUpgrade('multiWayShot');
        stats.applyUpgrade('multiWayShot');
        stats.reset();
        expect(stats.multiWayShotDamageMultiplier).toBe(1.0);
      });
    });

    describe('multiWayShotBulletCount', () => {
      it('should return 1 at level 1 (no upgrades)', () => {
        expect(stats.multiWayShotBulletCount).toBe(1);
      });

      it('should return 3 at level 2 (1 upgrade)', () => {
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotBulletCount).toBe(3);
      });

      it('should return 5 at level 3 (2 upgrades)', () => {
        stats.applyUpgrade('multiWayShot');
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotBulletCount).toBe(5);
      });

      it('should reset to 1 after reset()', () => {
        stats.applyUpgrade('multiWayShot');
        stats.applyUpgrade('multiWayShot');
        stats.reset();
        expect(stats.multiWayShotBulletCount).toBe(1);
      });
    });

    describe('multiWayShotLevel behavior change', () => {
      it('should still track internal level correctly', () => {
        expect(stats.multiWayShotLevel).toBe(1);
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotLevel).toBe(2);
        stats.applyUpgrade('multiWayShot');
        expect(stats.multiWayShotLevel).toBe(3);
      });
    });
  });

  describe('Direction calculation with new bullet counts', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should generate 1 direction at level 1', () => {
      const bulletCount = stats.multiWayShotBulletCount;
      const directions = calculateMultiWayShotDirections(100, 0, bulletCount);
      expect(directions).toHaveLength(1);
    });

    it('should generate 3 directions at level 2', () => {
      stats.applyUpgrade('multiWayShot');
      const bulletCount = stats.multiWayShotBulletCount;
      const directions = calculateMultiWayShotDirections(100, 0, bulletCount);
      expect(directions).toHaveLength(3);
    });

    it('should generate 5 directions at level 3', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      const bulletCount = stats.multiWayShotBulletCount;
      const directions = calculateMultiWayShotDirections(100, 0, bulletCount);
      expect(directions).toHaveLength(5);
    });

    it('should use 20 degree spread for level 2 (3 bullets)', () => {
      stats.applyUpgrade('multiWayShot');
      const bulletCount = stats.multiWayShotBulletCount;
      const directions = calculateMultiWayShotDirections(100, 0, bulletCount);

      // Center direction should be close to original
      const centerDir = directions[1];
      const centerLen = Math.sqrt(centerDir.dirX ** 2 + centerDir.dirY ** 2);
      expect(centerDir.dirX / centerLen).toBeCloseTo(1, 3);
      expect(centerDir.dirY / centerLen).toBeCloseTo(0, 3);

      // First direction should be at -20 degrees
      const expectedAngle = -(20 * Math.PI) / 180;
      const expectedDirY = Math.sin(expectedAngle);
      const dir1Len = Math.sqrt(directions[0].dirX ** 2 + directions[0].dirY ** 2);
      expect(directions[0].dirY / dir1Len).toBeCloseTo(expectedDirY, 2);
    });

    it('should use 20 and 40 degree spread for level 3 (5 bullets)', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      const bulletCount = stats.multiWayShotBulletCount;
      const directions = calculateMultiWayShotDirections(100, 0, bulletCount);

      // Center direction should be close to original (index 2)
      const centerDir = directions[2];
      const centerLen = Math.sqrt(centerDir.dirX ** 2 + centerDir.dirY ** 2);
      expect(centerDir.dirX / centerLen).toBeCloseTo(1, 3);
      expect(centerDir.dirY / centerLen).toBeCloseTo(0, 3);

      // First direction should be at -40 degrees
      const expectedAngle40 = -(40 * Math.PI) / 180;
      const expectedDirY40 = Math.sin(expectedAngle40);
      const dir1Len = Math.sqrt(directions[0].dirX ** 2 + directions[0].dirY ** 2);
      expect(directions[0].dirY / dir1Len).toBeCloseTo(expectedDirY40, 2);

      // Second direction should be at -20 degrees
      const expectedAngle20 = -(20 * Math.PI) / 180;
      const expectedDirY20 = Math.sin(expectedAngle20);
      const dir2Len = Math.sqrt(directions[1].dirX ** 2 + directions[1].dirY ** 2);
      expect(directions[1].dirY / dir2Len).toBeCloseTo(expectedDirY20, 2);
    });
  });

  describe('Damage balance verification', () => {
    it('level 1: single bullet at 100% = 1.0x total damage', () => {
      const bulletCount = MULTI_WAY_SHOT_BULLET_COUNTS[1];
      const multiplier = MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[1];
      const totalDamage = bulletCount * multiplier;
      expect(totalDamage).toBe(1.0);
    });

    it('level 2: 3 bullets at 50% = 1.5x total damage (if all hit)', () => {
      const bulletCount = MULTI_WAY_SHOT_BULLET_COUNTS[2];
      const multiplier = MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[2];
      const totalDamage = bulletCount * multiplier;
      expect(totalDamage).toBe(1.5);
    });

    it('level 3: 5 bullets at 40% = 2.0x total damage (if all hit)', () => {
      const bulletCount = MULTI_WAY_SHOT_BULLET_COUNTS[3];
      const multiplier = MULTI_WAY_SHOT_DAMAGE_MULTIPLIERS[3];
      const totalDamage = bulletCount * multiplier;
      expect(totalDamage).toBe(2.0);
    });
  });

  describe('Max level constraint', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should be maxed after 2 upgrades (reaching level 3)', () => {
      stats.applyUpgrade('multiWayShot');
      expect(stats.isUpgradeMaxed('multiWayShot')).toBe(false);
      stats.applyUpgrade('multiWayShot');
      expect(stats.isUpgradeMaxed('multiWayShot')).toBe(true);
    });

    it('should not appear in available upgrades when maxed', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      const available = stats.getAvailableUpgrades();
      expect(available).not.toContain('multiWayShot');
    });
  });

  describe('removeUpgrade behavior', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should decrease bullet count when removing upgrade', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      expect(stats.multiWayShotBulletCount).toBe(5);

      stats.removeUpgrade('multiWayShot');
      expect(stats.multiWayShotBulletCount).toBe(3);
    });

    it('should increase damage multiplier when removing upgrade', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      expect(stats.multiWayShotDamageMultiplier).toBe(0.4);

      stats.removeUpgrade('multiWayShot');
      expect(stats.multiWayShotDamageMultiplier).toBe(0.5);
    });
  });

  describe('Damage calculation with attack power', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should calculate enemy damage as attackPower * damageMultiplier', () => {
      // Base attack power is 1.0, level 1 multiplier is 1.0
      const enemyDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(enemyDamage).toBe(1.0);
    });

    it('should reduce enemy damage at level 2 (50%)', () => {
      stats.applyUpgrade('multiWayShot');
      const enemyDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(enemyDamage).toBe(0.5);
    });

    it('should reduce enemy damage at level 3 (40%)', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      const enemyDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(enemyDamage).toBe(0.4);
    });

    it('should combine attack power upgrade with damage multiplier', () => {
      // Upgrade attack power 5 times: 1.0 + 5*0.2 = 2.0
      for (let i = 0; i < 5; i++) {
        stats.applyUpgrade('attackPower');
      }
      expect(stats.attackPower).toBeCloseTo(2.0, 5);

      // Upgrade multi-way shot to level 3
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      expect(stats.multiWayShotDamageMultiplier).toBe(0.4);

      // Final damage: 2.0 * 0.4 = 0.8
      const enemyDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(enemyDamage).toBeCloseTo(0.8, 5);
    });

    it('should apply damage multiplier to wall damage without floor or minimum', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');

      const wallDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(wallDamage).toBe(0.4);
    });

    it('should calculate wall damage with upgraded attack power', () => {
      // Upgrade attack power 10 times: 1.0 + 10*0.2 = 3.0
      for (let i = 0; i < 10; i++) {
        stats.applyUpgrade('attackPower');
      }

      // Upgrade multi-way shot to level 3 (0.4 multiplier)
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');

      // Wall damage: 3.0 * 0.4 = 1.2
      const wallDamage = stats.attackPower * stats.multiWayShotDamageMultiplier;
      expect(wallDamage).toBeCloseTo(1.2, 5);
    });
  });
});
