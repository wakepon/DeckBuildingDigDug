import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WallManager } from '../WallManager';
import { FloorManager } from '../FloorManager';
import { TILE_SIZE, GRID_COLS, GRID_ROWS } from '../constants';

// Mock pixi.js
vi.mock('pixi.js', () => {
  return {
    Container: class MockContainer {
      addChild = vi.fn();
      removeChild = vi.fn();
      children: unknown[] = [];
    },
    Graphics: class MockGraphics {
      x = 0;
      y = 0;
      rect = vi.fn().mockReturnThis();
      fill = vi.fn().mockReturnThis();
      stroke = vi.fn().mockReturnThis();
      clear = vi.fn().mockReturnThis();
      moveTo = vi.fn().mockReturnThis();
      lineTo = vi.fn().mockReturnThis();
      destroy = vi.fn();
    },
  };
});

describe('WallManager Dynamic Floor Size', () => {
  let wallManager: WallManager;
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
    wallManager = new WallManager(floorManager);
  });

  describe('Grid dimensions on floor 1', () => {
    it('should use floor 1 dimensions from FloorManager', () => {
      const expectedDims = floorManager.getFloorGridDimensions();
      const gridDims = wallManager.getGridDimensions();

      expect(gridDims.cols).toBe(expectedDims.cols);
      expect(gridDims.rows).toBe(expectedDims.rows);
    });

    it('should have smaller grid than max on floor 1', () => {
      const gridDims = wallManager.getGridDimensions();

      expect(gridDims.cols).toBeLessThanOrEqual(GRID_COLS);
      expect(gridDims.rows).toBeLessThanOrEqual(GRID_ROWS);
    });

    it('should spawn player at valid random position within floor grid', () => {
      const gridDims = floorManager.getFloorGridDimensions();
      const spawnArea = wallManager.getSpawnArea();

      // Random spawn position should be within valid bounds
      // (not on outer walls and safe zone fits within playable area)
      expect(spawnArea.centerX).toBeGreaterThan(0);
      expect(spawnArea.centerX).toBeLessThan(gridDims.cols - 1);
      expect(spawnArea.centerY).toBeGreaterThan(0);
      expect(spawnArea.centerY).toBeLessThan(gridDims.rows - 1);
    });
  });

  describe('Grid dimensions on higher floors', () => {
    it('should use floor 5 dimensions after advancing', () => {
      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      // Reset wall manager to use new floor dimensions
      wallManager.reset();

      const expectedDims = floorManager.getFloorGridDimensions();
      const gridDims = wallManager.getGridDimensions();

      expect(gridDims.cols).toBe(expectedDims.cols);
      expect(gridDims.rows).toBe(expectedDims.rows);
    });

    it('should increase grid size on higher floors', () => {
      const floor1Dims = wallManager.getGridDimensions();

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      const floor5Dims = wallManager.getGridDimensions();

      expect(floor5Dims.cols).toBeGreaterThanOrEqual(floor1Dims.cols);
      expect(floor5Dims.rows).toBeGreaterThanOrEqual(floor1Dims.rows);
    });

    it('should use max grid dimensions on floor 10', () => {
      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      const gridDims = wallManager.getGridDimensions();

      expect(gridDims.cols).toBe(GRID_COLS);
      expect(gridDims.rows).toBe(GRID_ROWS);
    });
  });

  describe('Stairs position', () => {
    it('should generate stairs within current floor bounds', () => {
      const gridDims = wallManager.getGridDimensions();
      const stairsPos = wallManager.stairsPosition;

      expect(stairsPos.x).toBeGreaterThanOrEqual(0);
      expect(stairsPos.x).toBeLessThan(gridDims.cols);
      expect(stairsPos.y).toBeGreaterThanOrEqual(0);
      expect(stairsPos.y).toBeLessThan(gridDims.rows);
    });

    it('should generate stairs within floor bounds after advancing', () => {
      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      const gridDims = wallManager.getGridDimensions();
      const stairsPos = wallManager.stairsPosition;

      expect(stairsPos.x).toBeGreaterThanOrEqual(0);
      expect(stairsPos.x).toBeLessThan(gridDims.cols);
      expect(stairsPos.y).toBeGreaterThanOrEqual(0);
      expect(stairsPos.y).toBeLessThan(gridDims.rows);
    });
  });

  describe('getWall bounds checking', () => {
    it('should return null for positions outside current floor bounds', () => {
      const gridDims = wallManager.getGridDimensions();

      // Position beyond current floor (but within max grid)
      const beyondFloor = wallManager.getWall(gridDims.cols, gridDims.rows);
      expect(beyondFloor).toBeNull();
    });

    it('should return wall for valid positions within floor bounds', () => {
      const gridDims = wallManager.getGridDimensions();
      const spawnArea = wallManager.getSpawnArea();

      // Find a position that is within floor bounds but not spawn area
      let foundValidPosition = false;
      for (let x = 0; x < gridDims.cols && !foundValidPosition; x++) {
        for (let y = 0; y < gridDims.rows && !foundValidPosition; y++) {
          const dx = Math.abs(x - spawnArea.centerX);
          const dy = Math.abs(y - spawnArea.centerY);
          if (dx > spawnArea.radius || dy > spawnArea.radius) {
            const wall = wallManager.getWall(x, y);
            expect(wall).not.toBeNull();
            foundValidPosition = true;
          }
        }
      }

      expect(foundValidPosition).toBe(true);
    });
  });

  describe('World dimensions', () => {
    it('should return correct world dimensions in pixels', () => {
      const gridDims = wallManager.getGridDimensions();
      const worldDims = wallManager.getWorldDimensions();

      expect(worldDims.width).toBe(gridDims.cols * TILE_SIZE);
      expect(worldDims.height).toBe(gridDims.rows * TILE_SIZE);
    });

    it('should update world dimensions after floor change', () => {
      const floor1World = wallManager.getWorldDimensions();

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      const floor5World = wallManager.getWorldDimensions();

      expect(floor5World.width).toBeGreaterThanOrEqual(floor1World.width);
      expect(floor5World.height).toBeGreaterThanOrEqual(floor1World.height);
    });
  });

  describe('reset', () => {
    it('should update dimensions after floor manager advances', () => {
      // Advance floor manager
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      // Reset wall manager
      wallManager.reset();

      const newDims = wallManager.getGridDimensions();
      const expectedDims = floorManager.getFloorGridDimensions();

      expect(newDims.cols).toBe(expectedDims.cols);
      expect(newDims.rows).toBe(expectedDims.rows);
    });
  });

  describe('getWallCenters with dynamic size', () => {
    it('should return wall centers within current floor bounds', () => {
      const gridDims = wallManager.getGridDimensions();
      const centers = wallManager.getWallCenters();

      for (const center of centers) {
        expect(center.x).toBeGreaterThanOrEqual(0);
        expect(center.x).toBeLessThan(gridDims.cols * TILE_SIZE);
        expect(center.y).toBeGreaterThanOrEqual(0);
        expect(center.y).toBeLessThan(gridDims.rows * TILE_SIZE);
      }
    });
  });
});
