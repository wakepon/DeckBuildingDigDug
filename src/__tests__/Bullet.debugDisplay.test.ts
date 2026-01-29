import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Bullet } from '../Bullet';
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

describe('Bullet Damage Debug Display', () => {
  let bullet: Bullet;
  let debugDisplayManager: DebugDisplayManager;
  const damage = 5;

  beforeEach(() => {
    vi.clearAllMocks();
    debugDisplayManager = new DebugDisplayManager();
    // Create bullet at (100, 100) moving right
    bullet = new Bullet(100, 100, 1, 0);
  });

  describe('setDebugDisplayManager', () => {
    it('should accept a DebugDisplayManager instance', () => {
      expect(() => {
        bullet.setDebugDisplayManager(debugDisplayManager);
      }).not.toThrow();
    });
  });

  describe('setDamage', () => {
    it('should set the damage value for display', () => {
      bullet.setDamage(damage);

      expect(bullet.getDamage()).toBe(damage);
    });
  });

  describe('damage text visibility', () => {
    beforeEach(() => {
      bullet.setDebugDisplayManager(debugDisplayManager);
      bullet.setDamage(damage);
    });

    it('should not show damage text when debug display is disabled', () => {
      expect(debugDisplayManager.getState().showBulletDamage).toBe(false);

      bullet.update(0.016);

      expect(bullet.isDamageTextVisible()).toBe(false);
    });

    it('should show damage text when bullet damage debug display is enabled', () => {
      debugDisplayManager.setBulletDamage(true);

      bullet.update(0.016);

      expect(bullet.isDamageTextVisible()).toBe(true);
    });

    it('should hide damage text when bullet damage debug display is disabled after being enabled', () => {
      debugDisplayManager.setBulletDamage(true);
      bullet.update(0.016);
      expect(bullet.isDamageTextVisible()).toBe(true);

      debugDisplayManager.setBulletDamage(false);
      bullet.update(0.016);

      expect(bullet.isDamageTextVisible()).toBe(false);
    });
  });

  describe('damage text content', () => {
    beforeEach(() => {
      bullet.setDebugDisplayManager(debugDisplayManager);
      bullet.setDamage(damage);
      debugDisplayManager.setBulletDamage(true);
    });

    it('should display current damage value', () => {
      bullet.update(0.016);

      expect(bullet.getDamageText()).toBe('5');
    });

    it('should update damage text when damage is changed', () => {
      bullet.update(0.016);
      expect(bullet.getDamageText()).toBe('5');

      bullet.setDamage(10);
      bullet.update(0.016);

      expect(bullet.getDamageText()).toBe('10');
    });
  });

  describe('without debug display manager', () => {
    it('should not show damage text when no manager is set', () => {
      bullet.setDamage(damage);
      bullet.update(0.016);

      expect(bullet.isDamageTextVisible()).toBe(false);
    });

    it('should not throw when updating without manager', () => {
      expect(() => {
        bullet.update(0.016);
      }).not.toThrow();
    });
  });
});
