import { describe, it, expect, beforeEach } from 'vitest';
import { FloorManager } from '../FloorManager';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
} from '../constants';

describe('FloorManager Dynamic Floor Size', () => {
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
  });

  describe('getFloorGridDimensions', () => {
    describe('Floor 1 (Starting Floor)', () => {
      it('should return base grid dimensions on floor 1', () => {
        const dimensions = floorManager.getFloorGridDimensions();

        expect(dimensions.cols).toBeDefined();
        expect(dimensions.rows).toBeDefined();
        expect(dimensions.cols).toBeGreaterThan(0);
        expect(dimensions.rows).toBeGreaterThan(0);
      });

      it('should return smaller dimensions than max on floor 1', () => {
        const dimensions = floorManager.getFloorGridDimensions();

        // Floor 1 should start smaller than max grid size
        expect(dimensions.cols).toBeLessThanOrEqual(GRID_COLS);
        expect(dimensions.rows).toBeLessThanOrEqual(GRID_ROWS);
      });

      it('should return dimensions large enough for gameplay', () => {
        const dimensions = floorManager.getFloorGridDimensions();

        // Minimum playable area: at least 15x11 (matches FLOOR_SIZE_SCALING.BASE_COLS/BASE_ROWS)
        expect(dimensions.cols).toBeGreaterThanOrEqual(15);
        expect(dimensions.rows).toBeGreaterThanOrEqual(11);
      });
    });

    describe('Floor progression', () => {
      it('should increase grid size as floors progress', () => {
        const floor1Dims = floorManager.getFloorGridDimensions();

        // Advance to floor 5
        for (let i = 0; i < 4; i++) {
          floorManager.nextFloor();
        }

        const floor5Dims = floorManager.getFloorGridDimensions();

        // Floor 5 should be larger than floor 1
        expect(floor5Dims.cols).toBeGreaterThanOrEqual(floor1Dims.cols);
        expect(floor5Dims.rows).toBeGreaterThanOrEqual(floor1Dims.rows);
      });

      it('should reach maximum size by floor 10', () => {
        // Advance to floor 10
        for (let i = 0; i < 9; i++) {
          floorManager.nextFloor();
        }

        const floor10Dims = floorManager.getFloorGridDimensions();

        // Floor 10 should be at or near max
        expect(floor10Dims.cols).toBe(GRID_COLS);
        expect(floor10Dims.rows).toBe(GRID_ROWS);
      });

      it('should not exceed maximum grid size on floors beyond 10', () => {
        // Advance to floor 15
        for (let i = 0; i < 14; i++) {
          floorManager.nextFloor();
        }

        const floor15Dims = floorManager.getFloorGridDimensions();

        // Should be capped at max
        expect(floor15Dims.cols).toBe(GRID_COLS);
        expect(floor15Dims.rows).toBe(GRID_ROWS);
      });
    });

    describe('Aspect ratio consistency', () => {
      it('should maintain similar aspect ratio as floors progress', () => {
        const floor1Dims = floorManager.getFloorGridDimensions();
        const floor1Ratio = floor1Dims.cols / floor1Dims.rows;

        // Advance to floor 5
        for (let i = 0; i < 4; i++) {
          floorManager.nextFloor();
        }

        const floor5Dims = floorManager.getFloorGridDimensions();
        const floor5Ratio = floor5Dims.cols / floor5Dims.rows;

        // Ratios should be close (within 20%)
        expect(Math.abs(floor5Ratio - floor1Ratio) / floor1Ratio).toBeLessThan(0.2);
      });
    });
  });

  describe('getFloorWorldDimensions', () => {
    it('should return world dimensions in pixels', () => {
      const dimensions = floorManager.getFloorWorldDimensions();

      expect(dimensions.width).toBeDefined();
      expect(dimensions.height).toBeDefined();
    });

    it('should calculate world dimensions from grid dimensions and tile size', () => {
      const gridDims = floorManager.getFloorGridDimensions();
      const worldDims = floorManager.getFloorWorldDimensions();

      expect(worldDims.width).toBe(gridDims.cols * TILE_SIZE);
      expect(worldDims.height).toBe(gridDims.rows * TILE_SIZE);
    });

    it('should increase world size as floors progress', () => {
      const floor1World = floorManager.getFloorWorldDimensions();

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      const floor5World = floorManager.getFloorWorldDimensions();

      expect(floor5World.width).toBeGreaterThanOrEqual(floor1World.width);
      expect(floor5World.height).toBeGreaterThanOrEqual(floor1World.height);
    });
  });

  describe('getFloorSpawnCenter', () => {
    it('should return spawn center position', () => {
      const center = floorManager.getFloorSpawnCenter();

      expect(center.x).toBeDefined();
      expect(center.y).toBeDefined();
      expect(Number.isInteger(center.x)).toBe(true);
      expect(Number.isInteger(center.y)).toBe(true);
    });

    it('should return center of current floor grid', () => {
      const gridDims = floorManager.getFloorGridDimensions();
      const center = floorManager.getFloorSpawnCenter();

      expect(center.x).toBe(Math.floor(gridDims.cols / 2));
      expect(center.y).toBe(Math.floor(gridDims.rows / 2));
    });

    it('should update spawn center as floors progress', () => {
      const floor1Center = floorManager.getFloorSpawnCenter();

      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const floor10Center = floorManager.getFloorSpawnCenter();

      // Larger floor should have different center
      expect(floor10Center.x).toBeGreaterThanOrEqual(floor1Center.x);
      expect(floor10Center.y).toBeGreaterThanOrEqual(floor1Center.y);
    });
  });

  describe('reset', () => {
    it('should reset floor dimensions to floor 1 values', () => {
      const floor1Dims = floorManager.getFloorGridDimensions();

      // Advance floors
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }

      // Reset
      floorManager.reset();

      const resetDims = floorManager.getFloorGridDimensions();

      // Should be back to floor 1 dimensions
      expect(resetDims.cols).toBe(floor1Dims.cols);
      expect(resetDims.rows).toBe(floor1Dims.rows);
    });
  });

  describe('Edge cases', () => {
    it('should handle floor 1 correctly (no negative array access)', () => {
      expect(floorManager.currentFloor).toBe(1);
      expect(() => floorManager.getFloorGridDimensions()).not.toThrow();
    });

    it('should handle very high floor numbers', () => {
      // Advance to floor 100
      for (let i = 0; i < 99; i++) {
        floorManager.nextFloor();
      }

      const dimensions = floorManager.getFloorGridDimensions();

      // Should still return valid, capped dimensions
      expect(dimensions.cols).toBe(GRID_COLS);
      expect(dimensions.rows).toBe(GRID_ROWS);
    });
  });
});
