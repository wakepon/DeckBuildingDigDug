import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OxygenTankManager } from '../OxygenTankManager';
import { OxygenController } from '../OxygenController';
import { EventBus } from '../EventBus';
import { PlayerStats } from '../PlayerStats';
import { OXYGEN_MAX, OXYGEN_TANK_RESTORE } from '../constants';

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

describe('OxygenTankManager and OxygenController Integration', () => {
  let oxygenTankManager: OxygenTankManager;
  let oxygenController: OxygenController;
  let eventBus: EventBus;
  let playerStats: PlayerStats;

  beforeEach(() => {
    eventBus = new EventBus();
    playerStats = new PlayerStats();
    oxygenTankManager = new OxygenTankManager(eventBus);
    oxygenController = new OxygenController(playerStats);

    // Wire up the event listener (mimics Game.ts setup)
    eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
      oxygenController.addOxygen(event.amount);
    });
  });

  describe('end-to-end oxygen restoration', () => {
    it('should restore oxygen when tank is collected', () => {
      // Drain some oxygen first
      oxygenController.update(30); // Drain for 30 seconds (half oxygen)

      const oxygenBefore = oxygenController.oxygen;
      expect(oxygenBefore).toBe(OXYGEN_MAX - 30); // 30 oxygen remaining

      // Spawn and collect tank
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 100, 100);

      // Verify oxygen was restored
      const expectedRestore = OXYGEN_MAX * OXYGEN_TANK_RESTORE; // 6 oxygen
      const oxygenAfter = oxygenController.oxygen;
      expect(oxygenAfter).toBe(oxygenBefore + expectedRestore);
    });

    it('should not exceed max oxygen when collecting tank', () => {
      // Start at full oxygen
      expect(oxygenController.oxygen).toBe(OXYGEN_MAX);

      // Spawn and collect tank
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 100, 100);

      // Verify oxygen is capped at max
      expect(oxygenController.oxygen).toBe(OXYGEN_MAX);
    });

    it('should restore oxygen for each tank collected', () => {
      // Drain oxygen to 0
      oxygenController.update(60); // Drain all oxygen
      expect(oxygenController.oxygen).toBe(0);

      // Spawn and collect multiple tanks
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 100, 100);

      // Verify oxygen was restored for both tanks
      const expectedRestore = (OXYGEN_MAX * OXYGEN_TANK_RESTORE) * 2; // 12 oxygen
      expect(oxygenController.oxygen).toBe(expectedRestore);
    });

    it('should not restore oxygen when player is far from tank', () => {
      // Drain some oxygen
      oxygenController.update(30);
      const oxygenBefore = oxygenController.oxygen;

      // Spawn tank but don't collect it
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 500, 500); // Player is far away

      // Verify oxygen unchanged
      expect(oxygenController.oxygen).toBe(oxygenBefore);
    });
  });

  describe('event-driven architecture', () => {
    it('should decouple OxygenTankManager from OxygenController', () => {
      // Verify OxygenTankManager has no direct reference to OxygenController
      expect((oxygenTankManager as unknown as Record<string, unknown>).oxygenController).toBeUndefined();
    });

    it('should allow multiple listeners for OXYGEN_TANK_COLLECTED event', () => {
      const collectedAmounts: number[] = [];

      // Add another listener
      eventBus.on('OXYGEN_TANK_COLLECTED', (event) => {
        collectedAmounts.push(event.amount);
      });

      // Spawn and collect tank
      oxygenTankManager.spawnTank(100, 100);
      oxygenTankManager.update(0.016, 100, 100);

      // Both listeners should have been called
      expect(collectedAmounts).toHaveLength(1);
      expect(collectedAmounts[0]).toBe(OXYGEN_MAX * OXYGEN_TANK_RESTORE);
    });
  });
});
