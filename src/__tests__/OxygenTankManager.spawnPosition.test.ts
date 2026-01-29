import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OxygenTankManager } from '../OxygenTankManager';
import { EventBus } from '../EventBus';
import { FloorManager } from '../FloorManager';
import { TILE_SIZE, FLOOR_SIZE_SCALING } from '../constants';

// Mock PIXI.js with class-based mocks
vi.mock('pixi.js', () => {
  class MockGraphics {
    x = 0;
    y = 0;
    clear() { return this; }
    circle() { return this; }
    fill() { return this; }
    stroke() { return this; }
    rect() { return this; }
    roundRect() { return this; }
    destroy() {}
  }

  class MockContainer {
    x = 0;
    y = 0;
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

// Mock OxygenTank
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

describe('OxygenTankManager Spawn Position', () => {
  let eventBus: EventBus;
  let floorManager: FloorManager;
  let oxygenTankManager: OxygenTankManager;

  beforeEach(() => {
    eventBus = new EventBus();
    floorManager = new FloorManager();
  });

  describe('Initial tanks spawn within world bounds (BUG FIX)', () => {
    it('should accept spawn center in constructor', () => {
      const spawnCenter = floorManager.getFloorSpawnCenter();
      oxygenTankManager = new OxygenTankManager(eventBus, {
        x: spawnCenter.x,
        y: spawnCenter.y,
      });

      expect(oxygenTankManager).toBeDefined();
    });

    it('should spawn initial tanks within floor 1 world bounds', () => {
      const spawnCenter = floorManager.getFloorSpawnCenter();
      const worldDims = floorManager.getFloorWorldDimensions();

      oxygenTankManager = new OxygenTankManager(eventBus, {
        x: spawnCenter.x,
        y: spawnCenter.y,
      });

      // Get tank positions by checking getSafeZonePositions
      const tankPositions = oxygenTankManager.getSafeZonePositions();

      // All tank positions should be within floor 1 bounds
      for (const pos of tankPositions) {
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.y).toBeGreaterThan(0);
        expect(pos.x).toBeLessThan(worldDims.width);
        expect(pos.y).toBeLessThan(worldDims.height);
      }
    });

    it('should NOT spawn tanks outside floor 1 world bounds', () => {
      // Floor 1 has BASE_COLS (20) x BASE_ROWS (15) = 800x600 pixels
      const maxWorldX = FLOOR_SIZE_SCALING.BASE_COLS * TILE_SIZE;
      const maxWorldY = FLOOR_SIZE_SCALING.BASE_ROWS * TILE_SIZE;

      const spawnCenter = floorManager.getFloorSpawnCenter();
      oxygenTankManager = new OxygenTankManager(eventBus, {
        x: spawnCenter.x,
        y: spawnCenter.y,
      });

      const tankPositions = oxygenTankManager.getSafeZonePositions();

      for (const pos of tankPositions) {
        expect(pos.x).toBeLessThan(maxWorldX);
        expect(pos.y).toBeLessThan(maxWorldY);
      }
    });
  });

  describe('Spawn center updates on floor transition', () => {
    it('should support setSpawnCenter method for floor transitions', () => {
      const floor1SpawnCenter = floorManager.getFloorSpawnCenter();
      oxygenTankManager = new OxygenTankManager(eventBus, {
        x: floor1SpawnCenter.x,
        y: floor1SpawnCenter.y,
      });

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      const floor5SpawnCenter = floorManager.getFloorSpawnCenter();

      // Update spawn center
      oxygenTankManager.setSpawnCenter({
        x: floor5SpawnCenter.x,
        y: floor5SpawnCenter.y,
      });

      const tankPositions = oxygenTankManager.getSafeZonePositions();
      const floor5WorldDims = floorManager.getFloorWorldDimensions();

      // All tank positions should be within floor 5 bounds
      for (const pos of tankPositions) {
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.y).toBeGreaterThan(0);
        expect(pos.x).toBeLessThan(floor5WorldDims.width);
        expect(pos.y).toBeLessThan(floor5WorldDims.height);
      }
    });

    it('should spawn tanks around new center after setSpawnCenter', () => {
      const floor1SpawnCenter = floorManager.getFloorSpawnCenter();
      oxygenTankManager = new OxygenTankManager(eventBus, {
        x: floor1SpawnCenter.x,
        y: floor1SpawnCenter.y,
      });

      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const floor10SpawnCenter = floorManager.getFloorSpawnCenter();
      oxygenTankManager.setSpawnCenter({
        x: floor10SpawnCenter.x,
        y: floor10SpawnCenter.y,
      });

      const tankPositions = oxygenTankManager.getSafeZonePositions();
      const expectedCenterX = (floor10SpawnCenter.x + 0.5) * TILE_SIZE;
      const expectedCenterY = (floor10SpawnCenter.y + 0.5) * TILE_SIZE;

      // Tanks should be positioned around the new center
      // Check that the average position is close to the center
      const avgX = tankPositions.reduce((sum, p) => sum + p.x, 0) / tankPositions.length;
      const avgY = tankPositions.reduce((sum, p) => sum + p.y, 0) / tankPositions.length;

      expect(avgX).toBeCloseTo(expectedCenterX, 0);
      expect(avgY).toBeCloseTo(expectedCenterY, 0);
    });
  });

  describe('Backward compatibility', () => {
    it('should work without spawn center (defaults to something reasonable)', () => {
      // When no spawn center provided, should still work
      oxygenTankManager = new OxygenTankManager(eventBus);

      expect(oxygenTankManager).toBeDefined();
      // Should be able to spawn tanks without crashing
      expect(() => oxygenTankManager.spawnInitialTanks()).not.toThrow();
    });
  });
});
