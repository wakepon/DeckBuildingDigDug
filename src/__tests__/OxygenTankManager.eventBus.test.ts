import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OxygenTankManager } from '../OxygenTankManager';
import { EventBus } from '../EventBus';

// Mock PIXI.js
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    fill() { return this; }
    rect() { return this; }
    roundRect() { return this; }
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

// Mock OxygenTank with controllable collection
vi.mock('../OxygenTank', () => {
  return {
    OxygenTank: class MockOxygenTank {
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

describe('OxygenTankManager EventBus Integration', () => {
  let oxygenTankManager: OxygenTankManager;
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    oxygenTankManager = new OxygenTankManager(eventBus);
  });

  describe('constructor with EventBus', () => {
    it('should accept an EventBus instance in constructor', () => {
      const bus = new EventBus();

      // Should not throw
      expect(() => new OxygenTankManager(bus)).not.toThrow();
    });
  });

  describe('OXYGEN_TANK_COLLECTED event', () => {
    it('should emit OXYGEN_TANK_COLLECTED event when tank is collected', () => {
      const events: Array<{ type: string; amount: number }> = [];

      eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
        events.push(event);
      });

      // Spawn tank
      const tankX = 100;
      const tankY = 100;
      oxygenTankManager.spawnTank(tankX, tankY);

      // Player collects the tank by being at its location
      oxygenTankManager.update(0.016, tankX, tankY);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('OXYGEN_TANK_COLLECTED');
      expect(events[0].amount).toBeGreaterThan(0);
    });

    it('should emit correct oxygen restore amount based on OXYGEN_MAX and OXYGEN_TANK_RESTORE', () => {
      const events: Array<{ amount: number }> = [];

      eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
        events.push({ amount: event.amount });
      });

      // Spawn and collect tank
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 100, 100);

      expect(events).toHaveLength(1);
      // OXYGEN_MAX = 60, OXYGEN_TANK_RESTORE = 0.1, so amount = 60 * 0.1 = 6
      expect(events[0].amount).toBe(6);
    });

    it('should emit event for each tank collected', () => {
      const events: Array<{ amount: number }> = [];

      eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
        events.push({ amount: event.amount });
      });

      // Spawn multiple tanks at same location
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.spawnTank(100, 100);

      // Player collects all tanks
      oxygenTankManager.update(0.016, 100, 100);

      expect(events).toHaveLength(2);
    });

    it('should not emit event when tank is not collected', () => {
      const events: Array<{ type: string }> = [];

      eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
        events.push(event);
      });

      // Spawn tank
      oxygenTankManager.spawnTank(100, 100);

      // Player is far from tank
      oxygenTankManager.update(0.016, 500, 500);

      expect(events).toHaveLength(0);
    });
  });

  describe('removing old callback pattern', () => {
    it('should not have setOnOxygenCollected method after refactor', () => {
      // After refactoring, the old callback pattern should be removed
      // This test ensures we migrated fully to EventBus
      expect((oxygenTankManager as unknown as Record<string, unknown>).setOnOxygenCollected).toBeUndefined();
    });
  });
});
