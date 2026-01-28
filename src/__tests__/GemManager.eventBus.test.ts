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
    gemManager = new GemManager(playerStats, eventBus);
    gemManager.setExpValue(10);
  });

  describe('constructor with EventBus', () => {
    it('should accept an EventBus instance in constructor', () => {
      const bus = new EventBus();

      // Should not throw
      expect(() => new GemManager(playerStats, bus)).not.toThrow();
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

  });
});
