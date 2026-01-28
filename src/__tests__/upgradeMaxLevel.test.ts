import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats, UPGRADE_DATA } from '../PlayerStats';

describe('Upgrade Max Level System', () => {
  let stats: PlayerStats;

  beforeEach(() => {
    stats = new PlayerStats();
  });

  describe('UPGRADE_DATA maxLevel property', () => {
    it('should have maxLevel defined for all upgrade types', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      for (const type of allTypes) {
        expect(UPGRADE_DATA[type].maxLevel).toBeDefined();
        expect(typeof UPGRADE_DATA[type].maxLevel).toBe('number');
      }
    });

    it('should have maxLevel greater than 0 for all upgrades', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      for (const type of allTypes) {
        expect(UPGRADE_DATA[type].maxLevel).toBeGreaterThan(0);
      }
    });

    it('should have expected maxLevel values', () => {
      expect(UPGRADE_DATA.attackPower.maxLevel).toBe(10);
      expect(UPGRADE_DATA.attackSpeed.maxLevel).toBe(8);
      expect(UPGRADE_DATA.bulletSize.maxLevel).toBe(5);
      expect(UPGRADE_DATA.moveSpeed.maxLevel).toBe(10);
      expect(UPGRADE_DATA.maxHp.maxLevel).toBe(10);
      expect(UPGRADE_DATA.oxygenReduction.maxLevel).toBe(9);
      expect(UPGRADE_DATA.penetration.maxLevel).toBe(3);
      expect(UPGRADE_DATA.gemAttract.maxLevel).toBe(5);
      expect(UPGRADE_DATA.multiWayShot.maxLevel).toBe(2);
      expect(UPGRADE_DATA.bounce.maxLevel).toBe(5);
    });
  });

  describe('isUpgradeMaxed method', () => {
    it('should return false for upgrade with level 0', () => {
      expect(stats.isUpgradeMaxed('attackPower')).toBe(false);
    });

    it('should return false for upgrade below max level', () => {
      stats.applyUpgrade('attackPower');
      expect(stats.isUpgradeMaxed('attackPower')).toBe(false);
    });

    it('should return true when upgrade reaches max level', () => {
      // attackPower has maxLevel 10
      for (let i = 0; i < 10; i++) {
        stats.applyUpgrade('attackPower');
      }
      expect(stats.isUpgradeMaxed('attackPower')).toBe(true);
    });

    it('should return false when upgrade is one below max level', () => {
      // attackPower has maxLevel 10
      for (let i = 0; i < 9; i++) {
        stats.applyUpgrade('attackPower');
      }
      expect(stats.isUpgradeMaxed('attackPower')).toBe(false);
    });

    it('should work correctly for penetration (maxLevel 3)', () => {
      expect(stats.isUpgradeMaxed('penetration')).toBe(false);
      stats.applyUpgrade('penetration');
      expect(stats.isUpgradeMaxed('penetration')).toBe(false);
      stats.applyUpgrade('penetration');
      expect(stats.isUpgradeMaxed('penetration')).toBe(false);
      stats.applyUpgrade('penetration');
      expect(stats.isUpgradeMaxed('penetration')).toBe(true);
    });

    it('should work correctly for bulletSize (maxLevel 5)', () => {
      for (let i = 0; i < 4; i++) {
        stats.applyUpgrade('bulletSize');
      }
      expect(stats.isUpgradeMaxed('bulletSize')).toBe(false);
      stats.applyUpgrade('bulletSize');
      expect(stats.isUpgradeMaxed('bulletSize')).toBe(true);
    });
  });

  describe('getAvailableUpgrades method', () => {
    it('should return all upgrades when none are maxed', () => {
      const available = stats.getAvailableUpgrades();
      const allTypes = PlayerStats.getAllUpgradeTypes();
      expect(available.length).toBe(allTypes.length);
      for (const type of allTypes) {
        expect(available).toContain(type);
      }
    });

    it('should exclude maxed upgrades', () => {
      // Max out penetration (maxLevel 3)
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      const available = stats.getAvailableUpgrades();
      expect(available).not.toContain('penetration');
    });

    it('should return empty array when all upgrades are maxed', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      for (const type of allTypes) {
        const maxLevel = UPGRADE_DATA[type].maxLevel;
        for (let i = 0; i < maxLevel; i++) {
          stats.applyUpgrade(type);
        }
      }
      const available = stats.getAvailableUpgrades();
      expect(available).toEqual([]);
    });

    it('should return only non-maxed upgrades when some are maxed', () => {
      // Max out penetration and bounce
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      for (let i = 0; i < 5; i++) {
        stats.applyUpgrade('bounce');
      }

      const available = stats.getAvailableUpgrades();
      expect(available).not.toContain('penetration');
      expect(available).not.toContain('bounce');
      expect(available).toContain('attackPower');
      expect(available).toContain('moveSpeed');
    });
  });

  describe('getRandomUpgrades with max level filtering', () => {
    it('should not return maxed upgrades', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }

      // Run multiple times to ensure randomness doesnt include maxed upgrade
      for (let trial = 0; trial < 10; trial++) {
        const choices = stats.getRandomUpgrades(3);
        expect(choices).not.toContain('penetration');
      }
    });

    it('should return fewer choices when not enough available upgrades', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      // Max out all but 2 upgrades
      for (const type of allTypes) {
        if (type !== 'attackPower' && type !== 'moveSpeed') {
          const maxLevel = UPGRADE_DATA[type].maxLevel;
          for (let i = 0; i < maxLevel; i++) {
            stats.applyUpgrade(type);
          }
        }
      }

      const choices = stats.getRandomUpgrades(3);
      expect(choices.length).toBe(2);
      expect(choices).toContain('attackPower');
      expect(choices).toContain('moveSpeed');
    });

    it('should return empty array when all upgrades are maxed', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      for (const type of allTypes) {
        const maxLevel = UPGRADE_DATA[type].maxLevel;
        for (let i = 0; i < maxLevel; i++) {
          stats.applyUpgrade(type);
        }
      }

      const choices = stats.getRandomUpgrades(3);
      expect(choices).toEqual([]);
    });

    it('should return requested count when enough upgrades available', () => {
      const choices = stats.getRandomUpgrades(3);
      expect(choices.length).toBe(3);
    });
  });

  describe('getUpgradeMaxLevel static method', () => {
    it('should return correct max level for each upgrade type', () => {
      expect(PlayerStats.getUpgradeMaxLevel('attackPower')).toBe(10);
      expect(PlayerStats.getUpgradeMaxLevel('attackSpeed')).toBe(8);
      expect(PlayerStats.getUpgradeMaxLevel('bulletSize')).toBe(5);
      expect(PlayerStats.getUpgradeMaxLevel('moveSpeed')).toBe(10);
      expect(PlayerStats.getUpgradeMaxLevel('maxHp')).toBe(10);
      expect(PlayerStats.getUpgradeMaxLevel('oxygenReduction')).toBe(9);
      expect(PlayerStats.getUpgradeMaxLevel('penetration')).toBe(3);
      expect(PlayerStats.getUpgradeMaxLevel('gemAttract')).toBe(5);
      expect(PlayerStats.getUpgradeMaxLevel('multiWayShot')).toBe(2);
      expect(PlayerStats.getUpgradeMaxLevel('bounce')).toBe(5);
    });
  });

  describe('reset clears upgrade counts', () => {
    it('should make all upgrades available after reset', () => {
      // Max out some upgrades
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      for (let i = 0; i < 5; i++) {
        stats.applyUpgrade('bounce');
      }

      stats.reset();

      const available = stats.getAvailableUpgrades();
      const allTypes = PlayerStats.getAllUpgradeTypes();
      expect(available.length).toBe(allTypes.length);
      expect(stats.isUpgradeMaxed('penetration')).toBe(false);
      expect(stats.isUpgradeMaxed('bounce')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle checking maxed status after removeUpgrade', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      expect(stats.isUpgradeMaxed('penetration')).toBe(true);

      // Remove one
      stats.removeUpgrade('penetration');
      expect(stats.isUpgradeMaxed('penetration')).toBe(false);
    });

    it('should include upgrade in available list after removeUpgrade from max', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      expect(stats.getAvailableUpgrades()).not.toContain('penetration');

      // Remove one
      stats.removeUpgrade('penetration');
      expect(stats.getAvailableUpgrades()).toContain('penetration');
    });

    it('should handle all upgrade types independently', () => {
      // Max out one, partially level another
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      stats.applyUpgrade('attackPower');

      expect(stats.isUpgradeMaxed('penetration')).toBe(true);
      expect(stats.isUpgradeMaxed('attackPower')).toBe(false);
      expect(stats.getUpgradeCount('attackPower')).toBe(1);
    });
  });

  describe('level display text formatting', () => {
    it('should format level text correctly for non-maxed upgrade', () => {
      stats.applyUpgrade('attackPower');
      const level = stats.getUpgradeCount('attackPower');
      const maxLevel = UPGRADE_DATA.attackPower.maxLevel;
      expect(`Lv.${level} / ${maxLevel}`).toBe('Lv.1 / 10');
    });

    it('should indicate MAX when upgrade is maxed', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        stats.applyUpgrade('penetration');
      }
      const level = stats.getUpgradeCount('penetration');
      const maxLevel = UPGRADE_DATA.penetration.maxLevel;
      const isMaxed = stats.isUpgradeMaxed('penetration');
      expect(isMaxed).toBe(true);
      expect(level).toBe(maxLevel);
    });
  });
});
