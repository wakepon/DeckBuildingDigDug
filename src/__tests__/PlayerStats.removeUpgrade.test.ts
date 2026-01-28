import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStats } from '../PlayerStats';
import {
  UPGRADE_ATTACK_POWER,
  UPGRADE_MAX_HP,
  UPGRADE_PENETRATION,
} from '../constants';

describe('PlayerStats.removeUpgrade', () => {
  let stats: PlayerStats;

  beforeEach(() => {
    stats = new PlayerStats();
  });

  describe('removing non-existent upgrade', () => {
    it('should return false when removing an upgrade that was never acquired', () => {
      const result = stats.removeUpgrade('attackPower');
      expect(result).toBe(false);
    });

    it('should not modify stats when removing non-existent upgrade', () => {
      const originalAttackPower = stats.attackPower;
      stats.removeUpgrade('attackPower');
      expect(stats.attackPower).toBe(originalAttackPower);
    });

    it('should not modify acquiredUpgrades array when removing non-existent upgrade', () => {
      const originalLength = stats.acquiredUpgrades.length;
      stats.removeUpgrade('attackPower');
      expect(stats.acquiredUpgrades.length).toBe(originalLength);
    });
  });

  describe('removing existing upgrade - attackPower', () => {
    it('should return true when removing an acquired upgrade', () => {
      stats.applyUpgrade('attackPower');
      const result = stats.removeUpgrade('attackPower');
      expect(result).toBe(true);
    });

    it('should decrease attackPowerMultiplier by UPGRADE_ATTACK_POWER', () => {
      stats.applyUpgrade('attackPower');
      stats.applyUpgrade('attackPower');
      const beforeRemove = stats.attackPower;
      stats.removeUpgrade('attackPower');
      expect(stats.attackPower).toBeCloseTo(beforeRemove - UPGRADE_ATTACK_POWER, 5);
    });

    it('should not go below base multiplier of 1.0', () => {
      stats.applyUpgrade('attackPower');
      stats.removeUpgrade('attackPower');
      stats.removeUpgrade('attackPower'); // Try to remove again
      expect(stats.attackPower).toBe(1.0);
    });

    it('should remove one entry from acquiredUpgrades', () => {
      stats.applyUpgrade('attackPower');
      stats.applyUpgrade('attackPower');
      expect(stats.getUpgradeCount('attackPower')).toBe(2);
      stats.removeUpgrade('attackPower');
      expect(stats.getUpgradeCount('attackPower')).toBe(1);
    });
  });

  describe('removing existing upgrade - attackSpeed', () => {
    it('should decrease attackSpeedMultiplier', () => {
      stats.applyUpgrade('attackSpeed');
      stats.applyUpgrade('attackSpeed');
      const beforeRemove = stats.fireRate;
      stats.removeUpgrade('attackSpeed');
      // fireRate = FIRE_RATE / attackSpeedMultiplier
      // So decreasing multiplier should increase fireRate (slower)
      expect(stats.fireRate).toBeGreaterThan(beforeRemove);
    });

    it('should not go below base multiplier of 1.0', () => {
      stats.applyUpgrade('attackSpeed');
      stats.removeUpgrade('attackSpeed');
      stats.removeUpgrade('attackSpeed');
      // Should be back to base fire rate
      expect(stats.fireRate).toBeCloseTo(0.2, 5); // FIRE_RATE default
    });
  });

  describe('removing existing upgrade - bulletSize', () => {
    it('should decrease bulletSizeMultiplier', () => {
      stats.applyUpgrade('bulletSize');
      stats.applyUpgrade('bulletSize');
      const beforeRemove = stats.bulletSize;
      stats.removeUpgrade('bulletSize');
      expect(stats.bulletSize).toBeLessThan(beforeRemove);
    });

    it('should not go below base multiplier of 1.0', () => {
      stats.applyUpgrade('bulletSize');
      stats.removeUpgrade('bulletSize');
      stats.removeUpgrade('bulletSize');
      expect(stats.bulletSize).toBe(8); // BULLET_SIZE default
    });
  });

  describe('removing existing upgrade - moveSpeed', () => {
    it('should decrease moveSpeedMultiplier', () => {
      stats.applyUpgrade('moveSpeed');
      stats.applyUpgrade('moveSpeed');
      const beforeRemove = stats.moveSpeed;
      stats.removeUpgrade('moveSpeed');
      expect(stats.moveSpeed).toBeLessThan(beforeRemove);
    });

    it('should not go below base multiplier of 1.0', () => {
      stats.applyUpgrade('moveSpeed');
      stats.removeUpgrade('moveSpeed');
      stats.removeUpgrade('moveSpeed');
      expect(stats.moveSpeed).toBe(200); // PLAYER_SPEED default
    });
  });

  describe('removing existing upgrade - maxHp', () => {
    it('should decrease maxHpBonus', () => {
      stats.applyUpgrade('maxHp');
      stats.applyUpgrade('maxHp');
      const beforeRemove = stats.maxHp;
      stats.removeUpgrade('maxHp');
      expect(stats.maxHp).toBe(beforeRemove - UPGRADE_MAX_HP);
    });

    it('should not go below base maxHp of 100', () => {
      stats.applyUpgrade('maxHp');
      stats.removeUpgrade('maxHp');
      stats.removeUpgrade('maxHp');
      expect(stats.maxHp).toBe(100); // PLAYER_MAX_HP default
    });
  });

  describe('removing existing upgrade - oxygenReduction', () => {
    it('should increase oxygenDrainRate (undo the reduction)', () => {
      stats.applyUpgrade('oxygenReduction');
      stats.applyUpgrade('oxygenReduction');
      const beforeRemove = stats.oxygenDrainRate;
      stats.removeUpgrade('oxygenReduction');
      expect(stats.oxygenDrainRate).toBeGreaterThan(beforeRemove);
    });

    it('should not go above base multiplier of 1.0', () => {
      stats.applyUpgrade('oxygenReduction');
      stats.removeUpgrade('oxygenReduction');
      stats.removeUpgrade('oxygenReduction');
      expect(stats.oxygenDrainRate).toBe(1.0); // Base rate
    });
  });

  describe('removing existing upgrade - penetration', () => {
    it('should decrease penetrationCount', () => {
      stats.applyUpgrade('penetration');
      stats.applyUpgrade('penetration');
      const beforeRemove = stats.penetrationCount;
      stats.removeUpgrade('penetration');
      expect(stats.penetrationCount).toBe(beforeRemove - UPGRADE_PENETRATION);
    });

    it('should not go below 0', () => {
      stats.applyUpgrade('penetration');
      stats.removeUpgrade('penetration');
      stats.removeUpgrade('penetration');
      expect(stats.penetrationCount).toBe(0);
    });
  });

  describe('removing existing upgrade - gemAttract', () => {
    it('should decrease gemAttractMultiplier', () => {
      stats.applyUpgrade('gemAttract');
      stats.applyUpgrade('gemAttract');
      const beforeRemove = stats.gemAttractRange;
      stats.removeUpgrade('gemAttract');
      expect(stats.gemAttractRange).toBeLessThan(beforeRemove);
    });

    it('should not go below base multiplier of 1.0', () => {
      stats.applyUpgrade('gemAttract');
      stats.removeUpgrade('gemAttract');
      stats.removeUpgrade('gemAttract');
      expect(stats.gemAttractRange).toBe(100); // GEM_ATTRACT_RANGE default
    });
  });

  describe('removing existing upgrade - multiWayShot', () => {
    it('should decrease multiWayShotLevel', () => {
      stats.applyUpgrade('multiWayShot');
      stats.applyUpgrade('multiWayShot');
      expect(stats.multiWayShotLevel).toBe(3);
      stats.removeUpgrade('multiWayShot');
      expect(stats.multiWayShotLevel).toBe(2);
    });

    it('should not go below base level of 1', () => {
      stats.applyUpgrade('multiWayShot');
      stats.removeUpgrade('multiWayShot');
      stats.removeUpgrade('multiWayShot');
      expect(stats.multiWayShotLevel).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should only remove one upgrade at a time from multiple of same type', () => {
      stats.applyUpgrade('attackPower');
      stats.applyUpgrade('attackPower');
      stats.applyUpgrade('attackPower');
      expect(stats.getUpgradeCount('attackPower')).toBe(3);

      stats.removeUpgrade('attackPower');
      expect(stats.getUpgradeCount('attackPower')).toBe(2);

      stats.removeUpgrade('attackPower');
      expect(stats.getUpgradeCount('attackPower')).toBe(1);
    });

    it('should not affect other upgrade types when removing one type', () => {
      stats.applyUpgrade('attackPower');
      stats.applyUpgrade('moveSpeed');

      const originalMoveSpeed = stats.moveSpeed;
      stats.removeUpgrade('attackPower');

      expect(stats.moveSpeed).toBe(originalMoveSpeed);
      expect(stats.getUpgradeCount('moveSpeed')).toBe(1);
    });
  });
});
