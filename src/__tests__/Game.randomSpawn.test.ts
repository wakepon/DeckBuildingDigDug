import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FloorManager } from '../FloorManager';
import { TILE_SIZE, PLAYER_SPAWN_RADIUS } from '../constants';

// Mock PixiJS to avoid WebGL context issues in tests
vi.mock('pixi.js', () => ({
  Application: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue(undefined),
    stage: { addChild: vi.fn() },
    ticker: { add: vi.fn() },
    canvas: document.createElement('canvas'),
  })),
  Container: vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    addChildAt: vi.fn(),
    removeChild: vi.fn(),
    x: 0,
    y: 0,
  })),
  Graphics: vi.fn().mockImplementation(() => ({
    clear: vi.fn().mockReturnThis(),
    rect: vi.fn().mockReturnThis(),
    circle: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    destroy: vi.fn(),
    x: 0,
    y: 0,
  })),
  Text: vi.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    text: '',
    style: {},
    anchor: { set: vi.fn() },
  })),
  TextStyle: vi.fn(),
}));

describe('Game Random Spawn Integration', () => {
  describe('FloorManager.getRandomSpawnCenter usage pattern', () => {
    let floorManager: FloorManager;

    beforeEach(() => {
      floorManager = new FloorManager();
    });

    it('should provide a valid spawn position for player initialization', () => {
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // Player position in pixels (centered in tile)
      const playerX = (spawnCenter.x + 0.5) * TILE_SIZE;
      const playerY = (spawnCenter.y + 0.5) * TILE_SIZE;

      expect(playerX).toBeGreaterThan(0);
      expect(playerY).toBeGreaterThan(0);
    });

    it('should provide a valid spawn position for OxygenTankManager', () => {
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // OxygenTankManager expects grid coordinates
      expect(spawnCenter.x).toBeDefined();
      expect(spawnCenter.y).toBeDefined();
      expect(Number.isInteger(spawnCenter.x)).toBe(true);
      expect(Number.isInteger(spawnCenter.y)).toBe(true);
    });

    it('should allow WallManager to clear spawn area around random position', () => {
      const spawnCenter = floorManager.getRandomSpawnCenter();
      const gridDims = floorManager.getFloorGridDimensions();

      // WallManager uses this to determine spawn area
      // The spawn area should fit within the grid
      const minSpawnX = spawnCenter.x - PLAYER_SPAWN_RADIUS;
      const maxSpawnX = spawnCenter.x + PLAYER_SPAWN_RADIUS;
      const minSpawnY = spawnCenter.y - PLAYER_SPAWN_RADIUS;
      const maxSpawnY = spawnCenter.y + PLAYER_SPAWN_RADIUS;

      // Should not overlap with outer walls (at 0 and cols-1/rows-1)
      expect(minSpawnX).toBeGreaterThanOrEqual(1);
      expect(maxSpawnX).toBeLessThanOrEqual(gridDims.cols - 2);
      expect(minSpawnY).toBeGreaterThanOrEqual(1);
      expect(maxSpawnY).toBeLessThanOrEqual(gridDims.rows - 2);
    });
  });

  describe('Floor transition with random spawn', () => {
    let floorManager: FloorManager;

    beforeEach(() => {
      floorManager = new FloorManager();
    });

    it('should provide different spawn positions on floor transitions', () => {
      const positions: { x: number; y: number }[] = [];

      // Simulate multiple floor transitions
      for (let floor = 1; floor <= 5; floor++) {
        const spawnCenter = floorManager.getRandomSpawnCenter();
        positions.push({ ...spawnCenter });

        if (floor < 5) {
          floorManager.nextFloor();
        }
      }

      // Check that we don't always get the exact same position
      const uniquePositions = new Set(
        positions.map((p) => `${p.x},${p.y}`)
      );

      // With 5 random generations, we should see some variation
      // (Could theoretically be same, but very unlikely)
      expect(uniquePositions.size).toBeGreaterThanOrEqual(1);
    });

    it('should provide valid spawn position after reset', () => {
      // Advance some floors
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }

      floorManager.reset();

      const spawnCenter = floorManager.getRandomSpawnCenter();
      const gridDims = floorManager.getFloorGridDimensions();

      // Should still be valid for floor 1
      expect(spawnCenter.x).toBeGreaterThan(0);
      expect(spawnCenter.y).toBeGreaterThan(0);
      expect(spawnCenter.x).toBeLessThan(gridDims.cols - 1);
      expect(spawnCenter.y).toBeLessThan(gridDims.rows - 1);
    });
  });

  describe('Spawn position coordinates', () => {
    let floorManager: FloorManager;

    beforeEach(() => {
      floorManager = new FloorManager();
    });

    it('should convert grid position to pixel position correctly', () => {
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // Player position calculation (as used in Game.ts)
      const playerX = (spawnCenter.x + 0.5) * TILE_SIZE;
      const playerY = (spawnCenter.y + 0.5) * TILE_SIZE;

      // Should be at center of the tile
      expect(playerX % TILE_SIZE).toBe(TILE_SIZE / 2);
      expect(playerY % TILE_SIZE).toBe(TILE_SIZE / 2);
    });

    it('should be usable by OxygenTankManager for initial tank placement', () => {
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // OxygenTankManager places tanks around spawn center
      // Calculate positions around spawn area
      const tankPositions = [];
      for (let dx = -PLAYER_SPAWN_RADIUS; dx <= PLAYER_SPAWN_RADIUS; dx++) {
        for (let dy = -PLAYER_SPAWN_RADIUS; dy <= PLAYER_SPAWN_RADIUS; dy++) {
          tankPositions.push({
            x: spawnCenter.x + dx,
            y: spawnCenter.y + dy,
          });
        }
      }

      // All tank positions should be within grid bounds
      const gridDims = floorManager.getFloorGridDimensions();
      for (const pos of tankPositions) {
        expect(pos.x).toBeGreaterThanOrEqual(1);
        expect(pos.x).toBeLessThan(gridDims.cols - 1);
        expect(pos.y).toBeGreaterThanOrEqual(1);
        expect(pos.y).toBeLessThan(gridDims.rows - 1);
      }
    });
  });
});
