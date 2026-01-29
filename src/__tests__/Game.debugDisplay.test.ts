import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DebugDisplayManager } from '../DebugDisplayManager';

// This test file validates the Game.ts integration plan
// Since Game.ts has many dependencies, we test the integration logic separately

describe('Game Debug Display Integration', () => {
  let debugDisplayManager: DebugDisplayManager;

  beforeEach(() => {
    debugDisplayManager = new DebugDisplayManager();
  });

  describe('DebugDisplayManager initialization', () => {
    it('should initialize with all debug displays disabled', () => {
      const state = debugDisplayManager.getState();

      expect(state.showBlockHP).toBe(false);
      expect(state.showEnemyHP).toBe(false);
      expect(state.showBulletDamage).toBe(false);
    });
  });

  describe('State propagation', () => {
    it('should notify callback when block HP is toggled', () => {
      const callback = vi.fn();
      debugDisplayManager.onStateChange(callback);

      debugDisplayManager.toggleBlockHP();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ showBlockHP: true })
      );
    });

    it('should notify callback when enemy HP is toggled', () => {
      const callback = vi.fn();
      debugDisplayManager.onStateChange(callback);

      debugDisplayManager.toggleEnemyHP();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ showEnemyHP: true })
      );
    });

    it('should notify callback when bullet damage is toggled', () => {
      const callback = vi.fn();
      debugDisplayManager.onStateChange(callback);

      debugDisplayManager.toggleBulletDamage();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ showBulletDamage: true })
      );
    });
  });

  describe('Multiple managers can share state', () => {
    it('should allow components to read same state', () => {
      // Simulate Game setting state
      debugDisplayManager.setBlockHP(true);
      debugDisplayManager.setEnemyHP(true);
      debugDisplayManager.setBulletDamage(true);

      // All components reading from same manager should see same state
      const state = debugDisplayManager.getState();

      expect(state.showBlockHP).toBe(true);
      expect(state.showEnemyHP).toBe(true);
      expect(state.showBulletDamage).toBe(true);
    });
  });

  describe('Reset functionality', () => {
    it('should reset all debug displays', () => {
      debugDisplayManager.setBlockHP(true);
      debugDisplayManager.setEnemyHP(true);
      debugDisplayManager.setBulletDamage(true);

      debugDisplayManager.resetAll();

      const state = debugDisplayManager.getState();
      expect(state.showBlockHP).toBe(false);
      expect(state.showEnemyHP).toBe(false);
      expect(state.showBulletDamage).toBe(false);
    });
  });
});
