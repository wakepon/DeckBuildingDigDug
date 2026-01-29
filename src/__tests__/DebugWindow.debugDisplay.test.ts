import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DebugWindow } from '../DebugWindow';
import { DebugDisplayManager } from '../DebugDisplayManager';
import { PlayerStats } from '../PlayerStats';

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

describe('DebugWindow with DebugDisplayManager', () => {
  let debugWindow: DebugWindow;
  let playerStats: PlayerStats;
  let debugDisplayManager: DebugDisplayManager;

  beforeEach(() => {
    vi.clearAllMocks();
    playerStats = new PlayerStats();
    debugDisplayManager = new DebugDisplayManager();
    debugWindow = new DebugWindow(playerStats);
  });

  describe('setDebugDisplayManager', () => {
    it('should accept a DebugDisplayManager instance', () => {
      expect(() => {
        debugWindow.setDebugDisplayManager(debugDisplayManager);
      }).not.toThrow();
    });
  });

  describe('getDebugDisplayManager', () => {
    it('should return null when no manager is set', () => {
      expect(debugWindow.getDebugDisplayManager()).toBeNull();
    });

    it('should return the manager after it is set', () => {
      debugWindow.setDebugDisplayManager(debugDisplayManager);

      expect(debugWindow.getDebugDisplayManager()).toBe(debugDisplayManager);
    });
  });

  describe('toggle integration', () => {
    beforeEach(() => {
      debugWindow.setDebugDisplayManager(debugDisplayManager);
    });

    it('should toggle block HP in debug display manager', () => {
      expect(debugDisplayManager.getState().showBlockHP).toBe(false);

      debugWindow.toggleBlockHPDisplay();

      expect(debugDisplayManager.getState().showBlockHP).toBe(true);
    });

    it('should toggle enemy HP in debug display manager', () => {
      expect(debugDisplayManager.getState().showEnemyHP).toBe(false);

      debugWindow.toggleEnemyHPDisplay();

      expect(debugDisplayManager.getState().showEnemyHP).toBe(true);
    });

    it('should toggle bullet damage in debug display manager', () => {
      expect(debugDisplayManager.getState().showBulletDamage).toBe(false);

      debugWindow.toggleBulletDamageDisplay();

      expect(debugDisplayManager.getState().showBulletDamage).toBe(true);
    });

    it('should not throw when toggling without manager set', () => {
      const windowWithoutManager = new DebugWindow(playerStats);

      expect(() => {
        windowWithoutManager.toggleBlockHPDisplay();
      }).not.toThrow();

      expect(() => {
        windowWithoutManager.toggleEnemyHPDisplay();
      }).not.toThrow();

      expect(() => {
        windowWithoutManager.toggleBulletDamageDisplay();
      }).not.toThrow();
    });
  });

  describe('display state getters', () => {
    beforeEach(() => {
      debugWindow.setDebugDisplayManager(debugDisplayManager);
    });

    it('should return block HP display state', () => {
      expect(debugWindow.isBlockHPDisplayEnabled()).toBe(false);

      debugDisplayManager.setBlockHP(true);

      expect(debugWindow.isBlockHPDisplayEnabled()).toBe(true);
    });

    it('should return enemy HP display state', () => {
      expect(debugWindow.isEnemyHPDisplayEnabled()).toBe(false);

      debugDisplayManager.setEnemyHP(true);

      expect(debugWindow.isEnemyHPDisplayEnabled()).toBe(true);
    });

    it('should return bullet damage display state', () => {
      expect(debugWindow.isBulletDamageDisplayEnabled()).toBe(false);

      debugDisplayManager.setBulletDamage(true);

      expect(debugWindow.isBulletDamageDisplayEnabled()).toBe(true);
    });

    it('should return false when no manager is set', () => {
      const windowWithoutManager = new DebugWindow(playerStats);

      expect(windowWithoutManager.isBlockHPDisplayEnabled()).toBe(false);
      expect(windowWithoutManager.isEnemyHPDisplayEnabled()).toBe(false);
      expect(windowWithoutManager.isBulletDamageDisplayEnabled()).toBe(false);
    });
  });
});
