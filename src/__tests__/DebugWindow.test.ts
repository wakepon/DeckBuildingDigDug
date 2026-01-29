import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DebugWindow } from '../DebugWindow';
import { PlayerStats, UpgradeType } from '../PlayerStats';

// Mock PIXI.js with class implementations
vi.mock('pixi.js', () => {
  return {
    Container: class MockContainer {
      children: unknown[] = [];
      visible = true;
      x = 0;
      y = 0;
      eventMode = 'none';
      cursor = 'default';
      addChild(child: unknown) {
        this.children.push(child);
        return child;
      }
      removeChild(child: unknown) {
        const idx = this.children.indexOf(child);
        if (idx > -1) this.children.splice(idx, 1);
        return child;
      }
      destroy() {}
      on() {}
    },
    Graphics: class MockGraphics {
      x = 0;
      y = 0;
      roundRect() { return this; }
      fill() { return this; }
      stroke() { return this; }
      rect() { return this; }
      circle() { return this; }
      clear() { return this; }
      destroy() {}
    },
    Text: class MockText {
      x = 0;
      y = 0;
      text = '';
      style = {};
      anchor = { set: () => {} };
      constructor(options?: { text?: string }) {
        if (options?.text) this.text = options.text;
      }
      destroy() {}
    },
  };
});

describe('DebugWindow', () => {
  let debugWindow: DebugWindow;
  let playerStats: PlayerStats;

  beforeEach(() => {
    playerStats = new PlayerStats();
    debugWindow = new DebugWindow(playerStats);
  });

  describe('initial state', () => {
    it('should be hidden by default', () => {
      expect(debugWindow.isVisible).toBe(false);
    });

    it('should have a container', () => {
      expect(debugWindow.container).toBeDefined();
    });
  });

  describe('toggle', () => {
    it('should become visible when toggle is called while hidden', () => {
      expect(debugWindow.isVisible).toBe(false);
      debugWindow.toggle();
      expect(debugWindow.isVisible).toBe(true);
    });

    it('should become hidden when toggle is called while visible', () => {
      debugWindow.toggle(); // Show
      expect(debugWindow.isVisible).toBe(true);
      debugWindow.toggle(); // Hide
      expect(debugWindow.isVisible).toBe(false);
    });

    it('should toggle multiple times correctly', () => {
      expect(debugWindow.isVisible).toBe(false);
      debugWindow.toggle(); // Show
      expect(debugWindow.isVisible).toBe(true);
      debugWindow.toggle(); // Hide
      expect(debugWindow.isVisible).toBe(false);
      debugWindow.toggle(); // Show
      expect(debugWindow.isVisible).toBe(true);
    });
  });

  describe('show and hide', () => {
    it('should show the window with show()', () => {
      debugWindow.show();
      expect(debugWindow.isVisible).toBe(true);
    });

    it('should hide the window with hide()', () => {
      debugWindow.show();
      debugWindow.hide();
      expect(debugWindow.isVisible).toBe(false);
    });

    it('show() should be idempotent', () => {
      debugWindow.show();
      debugWindow.show();
      expect(debugWindow.isVisible).toBe(true);
    });

    it('hide() should be idempotent', () => {
      debugWindow.hide();
      debugWindow.hide();
      expect(debugWindow.isVisible).toBe(false);
    });
  });

  describe('onStatsChanged callback', () => {
    it('should call callback when upgrade is added via incrementUpgrade', () => {
      const callback = vi.fn();
      debugWindow.setOnStatsChanged(callback);

      debugWindow.incrementUpgrade('attackPower');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call callback when upgrade is removed via decrementUpgrade', () => {
      // First add an upgrade
      playerStats.applyUpgrade('attackPower');

      const callback = vi.fn();
      debugWindow.setOnStatsChanged(callback);

      debugWindow.decrementUpgrade('attackPower');

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call callback if no callback is set', () => {
      // Should not throw
      expect(() => debugWindow.incrementUpgrade('attackPower')).not.toThrow();
    });
  });

  describe('incrementUpgrade', () => {
    it('should increase the upgrade count in PlayerStats', () => {
      const initialCount = playerStats.getUpgradeCount('attackPower');
      debugWindow.incrementUpgrade('attackPower');
      expect(playerStats.getUpgradeCount('attackPower')).toBe(initialCount + 1);
    });

    it('should work for all upgrade types', () => {
      const allTypes: UpgradeType[] = [
        'attackPower',
        'attackSpeed',
        'bulletSize',
        'moveSpeed',
        'maxHp',
        'oxygenReduction',
        'penetration',
        'gemAttract',
        'multiWayShot',
      ];

      for (const type of allTypes) {
        const initialCount = playerStats.getUpgradeCount(type);
        debugWindow.incrementUpgrade(type);
        expect(playerStats.getUpgradeCount(type)).toBe(initialCount + 1);
      }
    });
  });

  describe('decrementUpgrade', () => {
    it('should decrease the upgrade count in PlayerStats when upgrade exists', () => {
      playerStats.applyUpgrade('attackPower');
      expect(playerStats.getUpgradeCount('attackPower')).toBe(1);

      debugWindow.decrementUpgrade('attackPower');
      expect(playerStats.getUpgradeCount('attackPower')).toBe(0);
    });

    it('should not go below 0 upgrades', () => {
      // No upgrades applied
      expect(playerStats.getUpgradeCount('attackPower')).toBe(0);

      debugWindow.decrementUpgrade('attackPower');
      expect(playerStats.getUpgradeCount('attackPower')).toBe(0);
    });

    it('should return false when no upgrade to remove', () => {
      const result = debugWindow.decrementUpgrade('attackPower');
      expect(result).toBe(false);
    });

    it('should return true when upgrade is successfully removed', () => {
      playerStats.applyUpgrade('attackPower');
      const result = debugWindow.decrementUpgrade('attackPower');
      expect(result).toBe(true);
    });
  });

  describe('getUpgradeLevel', () => {
    it('should return 0 for upgrades that have not been applied', () => {
      expect(debugWindow.getUpgradeLevel('attackPower')).toBe(0);
    });

    it('should return correct count after applying upgrades', () => {
      playerStats.applyUpgrade('attackPower');
      playerStats.applyUpgrade('attackPower');
      expect(debugWindow.getUpgradeLevel('attackPower')).toBe(2);
    });
  });

  describe('getAllUpgradeTypes', () => {
    it('should return all 11 upgrade types', () => {
      const types = debugWindow.getAllUpgradeTypes();
      expect(types).toHaveLength(11);
      expect(types).toContain('attackPower');
      expect(types).toContain('attackSpeed');
      expect(types).toContain('bulletSize');
      expect(types).toContain('moveSpeed');
      expect(types).toContain('maxHp');
      expect(types).toContain('oxygenReduction');
      expect(types).toContain('penetration');
      expect(types).toContain('gemAttract');
      expect(types).toContain('multiWayShot');
      expect(types).toContain('bounce');
      expect(types).toContain('pierceEnemy');
    });
  });

  describe('updateDisplay', () => {
    it('should not throw when called', () => {
      expect(() => debugWindow.updateDisplay()).not.toThrow();
    });

    it('should be called when upgrade is changed', () => {
      const spy = vi.spyOn(debugWindow, 'updateDisplay');
      debugWindow.incrementUpgrade('attackPower');
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should not throw when destroying', () => {
      expect(() => debugWindow.destroy()).not.toThrow();
    });
  });

  describe('max level functionality', () => {
    it('should not increment upgrade beyond max level', () => {
      // penetration has maxLevel 3
      debugWindow.incrementUpgrade('penetration');
      debugWindow.incrementUpgrade('penetration');
      debugWindow.incrementUpgrade('penetration');
      expect(playerStats.getUpgradeCount('penetration')).toBe(3);
      expect(playerStats.isUpgradeMaxed('penetration')).toBe(true);

      // Try to increment beyond max
      const result = debugWindow.incrementUpgrade('penetration');
      expect(result).toBe(false);
      expect(playerStats.getUpgradeCount('penetration')).toBe(3);
    });

    it('should return false when trying to increment maxed upgrade', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        debugWindow.incrementUpgrade('penetration');
      }

      const result = debugWindow.incrementUpgrade('penetration');
      expect(result).toBe(false);
    });

    it('should return true when incrementing non-maxed upgrade', () => {
      const result = debugWindow.incrementUpgrade('attackPower');
      expect(result).toBe(true);
    });

    it('should not call callback when increment fails due to max level', () => {
      // Max out penetration
      for (let i = 0; i < 3; i++) {
        playerStats.applyUpgrade('penetration');
      }

      const callback = vi.fn();
      debugWindow.setOnStatsChanged(callback);

      debugWindow.incrementUpgrade('penetration');
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
