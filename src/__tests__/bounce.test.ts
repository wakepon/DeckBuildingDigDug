import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats, UPGRADE_DATA, UpgradeType } from '../PlayerStats';
import { UPGRADE_BOUNCE } from '../constants';

describe('Bounce Upgrade Feature', () => {
  describe('Constants', () => {
    it('UPGRADE_BOUNCE should be defined as 1', () => {
      expect(UPGRADE_BOUNCE).toBe(1);
    });
  });

  describe('UPGRADE_DATA', () => {
    it('should contain bounce upgrade entry', () => {
      expect(UPGRADE_DATA).toHaveProperty('bounce');
    });

    it('bounce upgrade should have correct structure', () => {
      const bounce = UPGRADE_DATA['bounce' as UpgradeType];
      expect(bounce).toBeDefined();
      expect(bounce.type).toBe('bounce');
      expect(bounce.name).toBeDefined();
      expect(bounce.description).toBeDefined();
      expect(bounce.icon).toBeDefined();
      expect(bounce.color).toBeDefined();
    });
  });

  describe('PlayerStats.bounceCount', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should have initial bounceCount of 0 (no bounce)', () => {
      expect(stats.bounceCount).toBe(0);
    });

    it('should increase bounceCount by 1 when applying bounce upgrade', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.bounceCount).toBe(1);
    });

    it('should increase bounceCount cumulatively with multiple upgrades', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.bounceCount).toBe(3);
    });

    it('should reset bounceCount to 0 on reset()', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.bounceCount).toBe(2);

      stats.reset();
      expect(stats.bounceCount).toBe(0);
    });

    it('should include bounce in getAllUpgradeTypes()', () => {
      const allTypes = PlayerStats.getAllUpgradeTypes();
      expect(allTypes).toContain('bounce');
    });

    it('should track bounce in acquiredUpgrades', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.acquiredUpgrades).toContain('bounce');
    });

    it('should count bounce upgrades correctly with getUpgradeCount()', () => {
      expect(stats.getUpgradeCount('bounce' as UpgradeType)).toBe(0);

      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.getUpgradeCount('bounce' as UpgradeType)).toBe(1);

      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.getUpgradeCount('bounce' as UpgradeType)).toBe(2);
    });

    it('should correctly remove bounce upgrade', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('bounce' as UpgradeType);
      expect(stats.bounceCount).toBe(2);

      const result = stats.removeUpgrade('bounce' as UpgradeType);
      expect(result).toBe(true);
      expect(stats.bounceCount).toBe(1);
    });

    it('should not go below 0 when removing bounce upgrade', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.removeUpgrade('bounce' as UpgradeType);
      // Try to remove again - should fail since none left
      const result = stats.removeUpgrade('bounce' as UpgradeType);
      expect(result).toBe(false);
      expect(stats.bounceCount).toBe(0);
    });
  });

  describe('Bounce and Penetration interaction', () => {
    let stats: PlayerStats;

    beforeEach(() => {
      stats = new PlayerStats();
    });

    it('should allow both bounce and penetration upgrades', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('penetration' as UpgradeType);

      expect(stats.bounceCount).toBe(1);
      expect(stats.penetrationCount).toBe(2); // UPGRADE_PENETRATION = 2
    });

    it('should track both upgrades independently', () => {
      stats.applyUpgrade('bounce' as UpgradeType);
      stats.applyUpgrade('penetration' as UpgradeType);
      stats.applyUpgrade('bounce' as UpgradeType);

      expect(stats.bounceCount).toBe(2);
      expect(stats.penetrationCount).toBe(2);
      expect(stats.getUpgradeCount('bounce' as UpgradeType)).toBe(2);
      expect(stats.getUpgradeCount('penetration' as UpgradeType)).toBe(1);
    });
  });
});
