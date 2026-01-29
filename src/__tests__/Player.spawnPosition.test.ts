import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FloorManager } from '../FloorManager';
import { PlayerStats } from '../PlayerStats';
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
    moveTo() { return this; }
    lineTo() { return this; }
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

// Mock InputManager
vi.mock('../InputManager', () => {
  return {
    InputManager: class MockInputManager {
      get moveDirection() { return { x: 0, y: 0 }; }
    },
  };
});

// Mock WallManager to avoid complex Graphics operations
vi.mock('../WallManager', () => {
  return {
    WallManager: class MockWallManager {
      container = { addChild: vi.fn(), removeChild: vi.fn() };
      stairsPosition = { x: 5, y: 5 };

      getWall() { return null; }
      isStairsPosition() { return false; }
      reset() {}
      update() {}
    },
  };
});

// Import after mocks
import { Player } from '../Player';
import { InputManager } from '../InputManager';
import { WallManager } from '../WallManager';

describe('Player Spawn Position', () => {
  let floorManager: FloorManager;
  let wallManager: WallManager;
  let inputManager: InputManager;
  let playerStats: PlayerStats;

  beforeEach(() => {
    floorManager = new FloorManager();
    wallManager = new WallManager();
    inputManager = new InputManager();
    playerStats = new PlayerStats();
  });

  describe('Spawn within world bounds (BUG FIX)', () => {
    it('should spawn player within floor 1 world bounds', () => {
      // Floor 1 world dimensions
      const worldDims = floorManager.getFloorWorldDimensions();
      const spawnCenter = floorManager.getFloorSpawnCenter();

      // Create player with dynamic spawn center
      const player = new Player(
        inputManager,
        wallManager,
        playerStats,
        { x: spawnCenter.x, y: spawnCenter.y }
      );

      // Player position should be within world bounds
      expect(player.x).toBeGreaterThan(0);
      expect(player.y).toBeGreaterThan(0);
      expect(player.x).toBeLessThan(worldDims.width);
      expect(player.y).toBeLessThan(worldDims.height);
    });

    it('should spawn player at center of floor 1 grid', () => {
      const spawnCenter = floorManager.getFloorSpawnCenter();

      // Create player with dynamic spawn center
      const player = new Player(
        inputManager,
        wallManager,
        playerStats,
        { x: spawnCenter.x, y: spawnCenter.y }
      );

      // Expected spawn position
      const expectedX = (spawnCenter.x + 0.5) * TILE_SIZE;
      const expectedY = (spawnCenter.y + 0.5) * TILE_SIZE;

      expect(player.x).toBe(expectedX);
      expect(player.y).toBe(expectedY);
    });

    it('should NOT spawn player outside world bounds on floor 1', () => {
      // Floor 1 has BASE_COLS (20) x BASE_ROWS (15) = 800x600 pixels
      const expectedMaxX = FLOOR_SIZE_SCALING.BASE_COLS * TILE_SIZE;
      const expectedMaxY = FLOOR_SIZE_SCALING.BASE_ROWS * TILE_SIZE;

      const spawnCenter = floorManager.getFloorSpawnCenter();
      const player = new Player(
        inputManager,
        wallManager,
        playerStats,
        { x: spawnCenter.x, y: spawnCenter.y }
      );

      // Player should spawn within the floor 1 bounds (800x600)
      expect(player.x).toBeLessThan(expectedMaxX);
      expect(player.y).toBeLessThan(expectedMaxY);
    });
  });

  describe('Spawn position updates with floor progression', () => {
    it('should spawn player at floor 5 center when provided floor 5 spawn center', () => {
      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      const spawnCenter = floorManager.getFloorSpawnCenter();
      const worldDims = floorManager.getFloorWorldDimensions();

      const player = new Player(
        inputManager,
        wallManager,
        playerStats,
        { x: spawnCenter.x, y: spawnCenter.y }
      );

      // Player should be within floor 5 bounds
      expect(player.x).toBeGreaterThan(0);
      expect(player.y).toBeGreaterThan(0);
      expect(player.x).toBeLessThan(worldDims.width);
      expect(player.y).toBeLessThan(worldDims.height);

      // Should be at center
      const expectedX = (spawnCenter.x + 0.5) * TILE_SIZE;
      const expectedY = (spawnCenter.y + 0.5) * TILE_SIZE;
      expect(player.x).toBe(expectedX);
      expect(player.y).toBe(expectedY);
    });

    it('should spawn player at floor 10 center when provided floor 10 spawn center', () => {
      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const spawnCenter = floorManager.getFloorSpawnCenter();
      const worldDims = floorManager.getFloorWorldDimensions();

      const player = new Player(
        inputManager,
        wallManager,
        playerStats,
        { x: spawnCenter.x, y: spawnCenter.y }
      );

      // Player should be within floor 10 bounds
      expect(player.x).toBeGreaterThan(0);
      expect(player.y).toBeGreaterThan(0);
      expect(player.x).toBeLessThan(worldDims.width);
      expect(player.y).toBeLessThan(worldDims.height);
    });
  });

  describe('Backward compatibility', () => {
    it('should use default spawn center if not provided', () => {
      // When no spawn center is provided, should use floor 1 default center
      const player = new Player(
        inputManager,
        wallManager,
        playerStats
      );

      // Player should spawn at floor 1 center (10, 7) in grid coords
      const defaultCenterX = Math.floor(FLOOR_SIZE_SCALING.BASE_COLS / 2);
      const defaultCenterY = Math.floor(FLOOR_SIZE_SCALING.BASE_ROWS / 2);

      const expectedX = (defaultCenterX + 0.5) * TILE_SIZE;
      const expectedY = (defaultCenterY + 0.5) * TILE_SIZE;

      expect(player.x).toBe(expectedX);
      expect(player.y).toBe(expectedY);
    });
  });
});
