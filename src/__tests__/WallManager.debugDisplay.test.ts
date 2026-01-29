import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WallManager } from '../WallManager';
import { DebugDisplayManager } from '../DebugDisplayManager';

// Mock PIXI.js with class implementations
vi.mock('pixi.js', () => {
  return {
    Container: class MockContainer {
      children: unknown[] = [];
      visible = true;
      x = 0;
      y = 0;
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
      moveTo() { return this; }
      lineTo() { return this; }
      destroy() {}
    },
    Text: class MockText {
      x = 0;
      y = 0;
      text = '';
      style = {};
      visible = true;
      anchor = { set: () => {} };
      constructor(options?: { text?: string }) {
        if (options?.text) this.text = options.text;
      }
      destroy() {}
    },
  };
});

describe('WallManager HP Debug Display', () => {
  let wallManager: WallManager;
  let debugDisplayManager: DebugDisplayManager;

  beforeEach(() => {
    vi.clearAllMocks();
    debugDisplayManager = new DebugDisplayManager();
    wallManager = new WallManager();
  });

  describe('setDebugDisplayManager', () => {
    it('should accept a DebugDisplayManager instance', () => {
      expect(() => {
        wallManager.setDebugDisplayManager(debugDisplayManager);
      }).not.toThrow();
    });
  });

  describe('getDebugDisplayManager', () => {
    it('should return null when no manager is set', () => {
      expect(wallManager.getDebugDisplayManager()).toBeNull();
    });

    it('should return the manager after it is set', () => {
      wallManager.setDebugDisplayManager(debugDisplayManager);

      expect(wallManager.getDebugDisplayManager()).toBe(debugDisplayManager);
    });
  });

  describe('HP text visibility', () => {
    beforeEach(() => {
      wallManager.setDebugDisplayManager(debugDisplayManager);
    });

    it('should not show HP text when debug display is disabled', () => {
      expect(debugDisplayManager.getState().showBlockHP).toBe(false);

      wallManager.update();

      expect(wallManager.isHPTextVisible()).toBe(false);
    });

    it('should show HP text when block HP debug display is enabled', () => {
      debugDisplayManager.setBlockHP(true);

      wallManager.update();

      expect(wallManager.isHPTextVisible()).toBe(true);
    });

    it('should hide HP text when block HP debug display is disabled after being enabled', () => {
      debugDisplayManager.setBlockHP(true);
      wallManager.update();
      expect(wallManager.isHPTextVisible()).toBe(true);

      debugDisplayManager.setBlockHP(false);
      wallManager.update();

      expect(wallManager.isHPTextVisible()).toBe(false);
    });
  });

  describe('without debug display manager', () => {
    it('should not show HP text when no manager is set', () => {
      wallManager.update();

      expect(wallManager.isHPTextVisible()).toBe(false);
    });

    it('should not throw when updating without manager', () => {
      expect(() => {
        wallManager.update();
      }).not.toThrow();
    });
  });

  describe('HP text container', () => {
    beforeEach(() => {
      wallManager.setDebugDisplayManager(debugDisplayManager);
    });

    it('should have a container for HP text elements', () => {
      expect(wallManager.hpTextContainer).toBeDefined();
    });
  });
});
