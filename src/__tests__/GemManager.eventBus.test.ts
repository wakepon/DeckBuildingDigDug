import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GemManager } from '../GemManager';
import { EventBus } from '../EventBus';
import { PlayerStats } from '../PlayerStats';

// Mock PIXI.js
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    fill() { return this; }
    destroy() {}
  }

  class MockContainer {
    children: unknown[] = [];
    addChild(child: unknown) {
      this.children.push(child);
    }
    removeChild(child: unknown) {
      const index = this.children.indexOf(child);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    }
    destroy() {}
  }

  return {
    Graphics: MockGraphics,
    Container: MockContainer,
  };
});

// Mock Gem with controllable collection
vi.mock('../Gem', () => {
  return {
    Gem: class MockGem {
      x: number;
      y: number;
      active: boolean = true;
      collected: boolean = false;
      graphics: unknown;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.graphics = {};
      }

      setAttractRange() {}

      update(_deltaTime: number, playerX: number, playerY: number): boolean {
        // Simulate collection when player is close
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 20) {
          this.collected = true;
          this.active = false;
          return true;
        }
        return false;
      }

      destroy() {}
    },
  };
});

describe('GemManager EventBus Integration', () => {
  let gemManager: GemManager;
  let eventBus: EventBus;
  let playerStats: PlayerStats;

  beforeEach(() => {
    eventBus = new EventBus();
    playerStats = new PlayerStats();
    gemManager = new GemManager(playerStats);
    gemManager.setEventBus(eventBus);
    gemManager.setExpValue(10);
  });

  describe('setEventBus', () => {
    it('should accept an EventBus instance', () => {
      const manager = new GemManager(playerStats);
      const bus = new EventBus();

      // Should not throw
      expect(() => manager.setEventBus(bus)).not.toThrow();
    });
  });

  describe('GEM_COLLECTED event', () => {
    it('should emit GEM_COLLECTED event when gem is collected', () => {
      const events: Array<{ type: string; exp: number }> = [];

      eventBus.on('GEM_COLLECTED', (event) => {
        events.push(event);
      });

      // Spawn gem
      const gemX = 100;
      const gemY = 100;
      gemManager.spawnGem(gemX, gemY);

      // Player collects the gem by being at its location
      gemManager.update(0.016, gemX, gemY);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('GEM_COLLECTED');
      expect(events[0].exp).toBe(10);
    });

    it('should emit correct exp value when exp value is changed', () => {
      const events: Array<{ exp: number }> = [];

      eventBus.on('GEM_COLLECTED', (event) => {
        events.push({ exp: event.exp });
      });

      // Set custom exp value
      gemManager.setExpValue(25);

      // Spawn and collect gem
      gemManager.spawnGem(100, 100);
      gemManager.update(0.016, 100, 100);

      expect(events).toHaveLength(1);
      expect(events[0].exp).toBe(25);
    });

    it('should emit event for each gem collected', () => {
      const events: Array<{ exp: number }> = [];

      eventBus.on('GEM_COLLECTED', (event) => {
        events.push({ exp: event.exp });
      });

      // Spawn multiple gems at same location
      gemManager.spawnGem(100, 100);
      gemManager.spawnGem(100, 100);

      // Player collects all gems
      gemManager.update(0.016, 100, 100);

      expect(events).toHaveLength(2);
    });

    it('should not emit event when no EventBus is set', () => {
      const manager = new GemManager(playerStats);
      manager.setExpValue(10);

      // Should not throw even without EventBus
      manager.spawnGem(100, 100);
      expect(() => manager.update(0.016, 100, 100)).not.toThrow();
    });
  });

  describe('backward compatibility', () => {
    it('should still work with old callback pattern', () => {
      const manager = new GemManager(playerStats);
      let callbackExp = 0;

      manager.setOnExpGained((exp) => {
        callbackExp = exp;
      });
      manager.setExpValue(15);

      // Spawn and collect gem
      manager.spawnGem(100, 100);
      manager.update(0.016, 100, 100);

      expect(callbackExp).toBe(15);
    });

    it('should emit events AND call callbacks when both are set', () => {
      const manager = new GemManager(playerStats);
      const bus = new EventBus();
      manager.setEventBus(bus);
      manager.setExpValue(20);

      let callbackExp = 0;
      let eventExp = 0;

      manager.setOnExpGained((exp) => {
        callbackExp = exp;
      });

      bus.on('GEM_COLLECTED', (event) => {
        eventExp = event.exp;
      });

      // Spawn and collect gem
      manager.spawnGem(100, 100);
      manager.update(0.016, 100, 100);

      expect(callbackExp).toBe(20);
      expect(eventExp).toBe(20);
    });
  });
});
