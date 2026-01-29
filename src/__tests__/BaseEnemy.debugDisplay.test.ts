import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Enemy } from '../Enemy';
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
      beginFill() { return this; }
      endFill() { return this; }
      drawCircle() { return this; }
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

describe('Enemy HP Debug Display', () => {
  let enemy: Enemy;
  let debugDisplayManager: DebugDisplayManager;

  beforeEach(() => {
    vi.clearAllMocks();
    debugDisplayManager = new DebugDisplayManager();
    enemy = new Enemy(100, 100, 5);
  });

  describe('setDebugDisplayManager', () => {
    it('should accept a DebugDisplayManager instance', () => {
      expect(() => {
        enemy.setDebugDisplayManager(debugDisplayManager);
      }).not.toThrow();
    });
  });

  describe('HP text visibility', () => {
    beforeEach(() => {
      enemy.setDebugDisplayManager(debugDisplayManager);
    });

    it('should not show HP text when debug display is disabled', () => {
      expect(debugDisplayManager.getState().showEnemyHP).toBe(false);

      enemy.update(0.016, 200, 200);

      expect(enemy.isHPTextVisible()).toBe(false);
    });

    it('should show HP text when enemy HP debug display is enabled', () => {
      debugDisplayManager.setEnemyHP(true);

      enemy.update(0.016, 200, 200);

      expect(enemy.isHPTextVisible()).toBe(true);
    });

    it('should hide HP text when enemy HP debug display is disabled after being enabled', () => {
      debugDisplayManager.setEnemyHP(true);
      enemy.update(0.016, 200, 200);
      expect(enemy.isHPTextVisible()).toBe(true);

      debugDisplayManager.setEnemyHP(false);
      enemy.update(0.016, 200, 200);

      expect(enemy.isHPTextVisible()).toBe(false);
    });
  });

  describe('HP text content', () => {
    beforeEach(() => {
      enemy.setDebugDisplayManager(debugDisplayManager);
      debugDisplayManager.setEnemyHP(true);
    });

    it('should display current HP value', () => {
      enemy.update(0.016, 200, 200);

      expect(enemy.getHPText()).toBe('5');
    });

    it('should update HP text when enemy takes damage', () => {
      enemy.update(0.016, 200, 200);
      expect(enemy.getHPText()).toBe('5');

      enemy.takeDamage(2);
      enemy.update(0.016, 200, 200);

      expect(enemy.getHPText()).toBe('3');
    });
  });

  describe('without debug display manager', () => {
    it('should not show HP text when no manager is set', () => {
      // No manager set
      enemy.update(0.016, 200, 200);

      expect(enemy.isHPTextVisible()).toBe(false);
    });

    it('should not throw when updating without manager', () => {
      expect(() => {
        enemy.update(0.016, 200, 200);
      }).not.toThrow();
    });
  });
});
