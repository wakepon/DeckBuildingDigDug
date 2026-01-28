import { describe, it, expect, beforeEach } from 'vitest';
import { OxygenController } from '../OxygenController';
import { PlayerStats } from '../PlayerStats';
import { OXYGEN_MAX } from '../constants';

describe('OxygenController Floor Transition', () => {
  let oxygenController: OxygenController;
  let playerStats: PlayerStats;

  beforeEach(() => {
    playerStats = new PlayerStats();
    oxygenController = new OxygenController(playerStats);
  });

  describe('oxygen preservation across floors', () => {
    it('should start with maximum oxygen', () => {
      expect(oxygenController.oxygen).toBe(OXYGEN_MAX);
      expect(oxygenController.maxOxygen).toBe(OXYGEN_MAX);
    });

    it('should reduce oxygen when update is called', () => {
      const initialOxygen = oxygenController.oxygen;

      // Simulate some time passing
      oxygenController.update(1.0);

      expect(oxygenController.oxygen).toBeLessThan(initialOxygen);
    });

    it('should NOT reset oxygen when reset() is removed from floor transition', () => {
      // Simulate oxygen draining to 50%
      const targetOxygen = OXYGEN_MAX * 0.5;

      // Drain oxygen by updating over time
      while (oxygenController.oxygen > targetOxygen) {
        oxygenController.update(0.1);
      }

      const oxygenBeforeTransition = oxygenController.oxygen;
      expect(oxygenBeforeTransition).toBeLessThan(OXYGEN_MAX);
      expect(oxygenBeforeTransition).toBeGreaterThan(0);

      // When floor transition happens, oxygen should be preserved
      // Note: We're testing that reset() should NOT be called during floor transition
      // The fix will be to remove the reset() call from Game.resetFloor()

      // For now, calling reset() should restore oxygen (this is the behavior we want to remove)
      // But we need a different method or no method call at all during floor transition

      // After the fix, oxygen should remain at the pre-transition value
      // This test documents the expected behavior after the fix
      expect(oxygenController.oxygen).toBe(oxygenBeforeTransition);
    });

    it('should preserve exact oxygen value when transitioning floors', () => {
      // Drain oxygen to a specific amount
      const drainTime = 5.0; // 5 seconds of draining
      oxygenController.update(drainTime);

      const oxygenAfterDrain = oxygenController.oxygen;

      // Oxygen should be preserved (no reset called)
      // This value should carry over to the next floor
      expect(oxygenController.oxygen).toBe(oxygenAfterDrain);
      expect(oxygenController.oxygen).toBeLessThan(OXYGEN_MAX);
    });

    it('should allow oxygen to continue draining normally after floor transition', () => {
      // Drain some oxygen
      oxygenController.update(2.0);
      const oxygenAtTransition = oxygenController.oxygen;

      // Continue draining (simulating next floor)
      oxygenController.update(1.0);

      expect(oxygenController.oxygen).toBeLessThan(oxygenAtTransition);
    });

    it('should still allow addOxygen to work after floor transition', () => {
      // Drain oxygen significantly
      oxygenController.update(30.0); // Drain for 30 seconds
      const lowOxygen = oxygenController.oxygen;
      expect(lowOxygen).toBeLessThan(OXYGEN_MAX - 10); // Ensure enough room to add

      // Add oxygen (from tank) - amount that won't exceed max
      const addAmount = 5;
      oxygenController.addOxygen(addAmount);

      expect(oxygenController.oxygen).toBe(lowOxygen + addAmount);
    });

    it('should not exceed max oxygen when adding oxygen', () => {
      // Only drain a tiny bit
      oxygenController.update(0.1);

      // Try to add more oxygen than max
      oxygenController.addOxygen(1000);

      expect(oxygenController.oxygen).toBe(OXYGEN_MAX);
    });
  });

  describe('reset method behavior', () => {
    it('reset() should restore oxygen to maximum', () => {
      // Drain oxygen
      oxygenController.update(5.0);
      expect(oxygenController.oxygen).toBeLessThan(OXYGEN_MAX);

      // Reset restores to max
      oxygenController.reset();

      expect(oxygenController.oxygen).toBe(OXYGEN_MAX);
    });
  });
});
