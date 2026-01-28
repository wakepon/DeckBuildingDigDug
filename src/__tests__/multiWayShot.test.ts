import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats, UPGRADE_DATA, UpgradeType } from '../PlayerStats';
import {
  UPGRADE_MULTI_WAY_SHOT,
  MULTI_WAY_SHOT_ANGLE_SPREAD,
} from '../constants';

describe('Multi-Way Shot Feature', () => {
  describe('Constants', () => {
    it('UPGRADE_MULTI_WAY_SHOT should be defined as 1', () => {
      expect(UPGRADE_MULTI_WAY_SHOT).toBe(1);
    });

    it('MULTI_WAY_SHOT_ANGLE_SPREAD should be 20 degrees in radians', () => {
      const expectedRadians = (20 * Math.PI) / 180;
      expect(MULTI_WAY_SHOT_ANGLE_SPREAD).toBeCloseTo(expectedRadians, 5);
    });
  });

  describe('UPGRADE_DATA', () => {
    it('should contain multiWayShot upgrade entry', () => {
      expect(UPGRADE_DATA).toHaveProperty('multiWayShot');
    });

    it('multiWayShot upgrade should have correct structure', () => {
      const multiWayShot = UPGRADE_DATA['multiWayShot' as UpgradeType];
      expect(multiWayShot).toBeDefined();
      expect(multiWayShot.type).toBe('multiWayShot');
      expect(multiWayShot.name).toBeDefined();
      expect(multiWayShot.description).toBeDefined();
      expect(multiWayShot.icon).toBeDefined();
      expect(multiWayShot.color).toBeDefined();
    });
  });

  describe('PlayerStats.multiWayShotLevel', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should have initial multiWayShotLevel of 1 (single shot)', () => {
      expect(stats.multiWayShotLevel).toBe(1);
    });

    it('should increase multiWayShotLevel by 1 when applying multiWayShot upgrade', () => {
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      expect(stats.multiWayShotLevel).toBe(2);
    });

    it('should increase multiWayShotLevel cumulatively with multiple upgrades (max 2)', () => {
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      // With maxLevel 3, only 2 upgrades allowed (level 1 -> 2 -> 3)
      expect(stats.multiWayShotLevel).toBe(3);
    });

    it('should reset multiWayShotLevel to 1 on reset()', () => {
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      expect(stats.multiWayShotLevel).toBe(3);

      stats.reset();
      expect(stats.multiWayShotLevel).toBe(1);
    });

    it('should include multiWayShot in getAllUpgradeTypes()', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      expect(allTypes).toContain('multiWayShot');
    });

    it('should track multiWayShot in acquiredUpgrades', () => {
      stats.applyUpgrade('multiWayShot' as UpgradeType);
      expect(stats.acquiredUpgrades).toContain('multiWayShot');
    });

    it('should count multiWayShot upgrades correctly with getUpgradeCount()', () => {
      expect(stats.getUpgradeCount('multiWayShot' as UpgradeType)).toBe(0);

      stats.applyUpgrade('multiWayShot' as UpgradeType);
      expect(stats.getUpgradeCount('multiWayShot' as UpgradeType)).toBe(1);

      stats.applyUpgrade('multiWayShot' as UpgradeType);
      expect(stats.getUpgradeCount('multiWayShot' as UpgradeType)).toBe(2);
    });
  });
});
