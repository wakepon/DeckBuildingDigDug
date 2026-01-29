import { describe, it, expect, beforeEach } from 'vitest';
import { FloorManager } from '../FloorManager';
import {
  FloorSizeConfig,
  createFloorSizeConfig,
  DEFAULT_FLOOR_SIZE_CONFIG,
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
} from '../constants';

describe('FloorManager with Configurable Floor Size', () => {
  describe('constructor', () => {
    it('should accept no arguments and use default config', () => {
      const manager = new FloorManager();

      expect(manager).toBeDefined();
      expect(manager.currentFloor).toBe(1);
    });

    it('should accept a FloorSizeConfig', () => {
      const config = createFloorSizeConfig({
        baseCols: 20,
        baseRows: 15,
      });

      const manager = new FloorManager(config);

      expect(manager).toBeDefined();
    });

    it('should use provided config for floor dimensions', () => {
      const config = createFloorSizeConfig({
        baseCols: 20,
        baseRows: 15,
        maxCols: 40,
        maxRows: 30,
        colsPerFloor: 2,
        rowsPerFloor: 1.5,
        maxFloorForScaling: 10,
      });

      const manager = new FloorManager(config);
      const dims = manager.getFloorGridDimensions();

      // Floor 1 should use baseCols and baseRows
      expect(dims.cols).toBe(20);
      expect(dims.rows).toBe(15);
    });
  });

  describe('getFloorGridDimensions with custom config', () => {
    describe('Floor 1 with custom base size', () => {
      it('should return custom base dimensions on floor 1', () => {
        const config = createFloorSizeConfig({
          baseCols: 25,
          baseRows: 20,
        });

        const manager = new FloorManager(config);
        const dims = manager.getFloorGridDimensions();

        expect(dims.cols).toBe(25);
        expect(dims.rows).toBe(20);
      });

      it('should respect custom max dimensions', () => {
        const config = createFloorSizeConfig({
          baseCols: 10,
          baseRows: 8,
          maxCols: 20,
          maxRows: 16,
          colsPerFloor: 5,
          rowsPerFloor: 4,
          maxFloorForScaling: 3,
        });

        const manager = new FloorManager(config);

        // Advance to floor 10 (way past max)
        for (let i = 0; i < 9; i++) {
          manager.nextFloor();
        }

        const dims = manager.getFloorGridDimensions();

        // Should be capped at custom max
        expect(dims.cols).toBe(20);
        expect(dims.rows).toBe(16);
      });
    });

    describe('scaling with custom config', () => {
      it('should scale according to custom colsPerFloor and rowsPerFloor', () => {
        const config = createFloorSizeConfig({
          baseCols: 10,
          baseRows: 10,
          maxCols: 50,
          maxRows: 50,
          colsPerFloor: 5,
          rowsPerFloor: 3,
          maxFloorForScaling: 10,
        });

        const manager = new FloorManager(config);

        // Floor 1: 10x10
        let dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(10);
        expect(dims.rows).toBe(10);

        // Floor 2: 10 + 5 = 15 cols, 10 + 3 = 13 rows
        manager.nextFloor();
        dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(15);
        expect(dims.rows).toBe(13);

        // Floor 3: 10 + 10 = 20 cols, 10 + 6 = 16 rows
        manager.nextFloor();
        dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(20);
        expect(dims.rows).toBe(16);
      });

      it('should respect maxFloorForScaling', () => {
        const config = createFloorSizeConfig({
          baseCols: 10,
          baseRows: 10,
          maxCols: 100,
          maxRows: 100,
          colsPerFloor: 5,
          rowsPerFloor: 5,
          maxFloorForScaling: 3,
        });

        const manager = new FloorManager(config);

        // Floor 3: 10 + 10 = 20 (max scaling floor)
        manager.nextFloor(); // floor 2
        manager.nextFloor(); // floor 3
        const floor3Dims = manager.getFloorGridDimensions();

        // Floor 5: should still be 20 (scaling stopped at floor 3)
        manager.nextFloor(); // floor 4
        manager.nextFloor(); // floor 5
        const floor5Dims = manager.getFloorGridDimensions();

        expect(floor5Dims.cols).toBe(floor3Dims.cols);
        expect(floor5Dims.rows).toBe(floor3Dims.rows);
      });
    });

    describe('static floor size (no scaling)', () => {
      it('should support fixed floor size with zero scaling', () => {
        const config = createFloorSizeConfig({
          baseCols: 20,
          baseRows: 15,
          maxCols: 20,
          maxRows: 15,
          colsPerFloor: 0,
          rowsPerFloor: 0,
          maxFloorForScaling: 1,
        });

        const manager = new FloorManager(config);

        // Floor 1
        let dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(20);
        expect(dims.rows).toBe(15);

        // Floor 10 - should be same
        for (let i = 0; i < 9; i++) {
          manager.nextFloor();
        }
        dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(20);
        expect(dims.rows).toBe(15);
      });
    });
  });

  describe('getFloorWorldDimensions with custom config', () => {
    it('should calculate world dimensions based on custom grid dimensions', () => {
      const config = createFloorSizeConfig({
        baseCols: 25,
        baseRows: 20,
      });

      const manager = new FloorManager(config);
      const worldDims = manager.getFloorWorldDimensions();

      expect(worldDims.width).toBe(25 * TILE_SIZE);
      expect(worldDims.height).toBe(20 * TILE_SIZE);
    });
  });

  describe('getFloorSpawnCenter with custom config', () => {
    it('should calculate spawn center based on custom grid dimensions', () => {
      const config = createFloorSizeConfig({
        baseCols: 30,
        baseRows: 20,
      });

      const manager = new FloorManager(config);
      const center = manager.getFloorSpawnCenter();

      expect(center.x).toBe(Math.floor(30 / 2));
      expect(center.y).toBe(Math.floor(20 / 2));
    });
  });

  describe('backward compatibility', () => {
    it('should produce same results as before when using defaults', () => {
      const managerWithDefaults = new FloorManager();
      const managerExplicitDefaults = new FloorManager(DEFAULT_FLOOR_SIZE_CONFIG);

      // Floor 1
      expect(managerWithDefaults.getFloorGridDimensions())
        .toEqual(managerExplicitDefaults.getFloorGridDimensions());

      // Floor 5
      for (let i = 0; i < 4; i++) {
        managerWithDefaults.nextFloor();
        managerExplicitDefaults.nextFloor();
      }
      expect(managerWithDefaults.getFloorGridDimensions())
        .toEqual(managerExplicitDefaults.getFloorGridDimensions());

      // Floor 10
      for (let i = 0; i < 5; i++) {
        managerWithDefaults.nextFloor();
        managerExplicitDefaults.nextFloor();
      }
      expect(managerWithDefaults.getFloorGridDimensions())
        .toEqual(managerExplicitDefaults.getFloorGridDimensions());
    });

    it('should still reach GRID_COLS/GRID_ROWS with default config', () => {
      const manager = new FloorManager();

      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        manager.nextFloor();
      }

      const dims = manager.getFloorGridDimensions();

      expect(dims.cols).toBe(GRID_COLS);
      expect(dims.rows).toBe(GRID_ROWS);
    });
  });

  describe('getFloorSizeConfig accessor', () => {
    it('should expose the current configuration', () => {
      const config = createFloorSizeConfig({
        baseCols: 25,
        baseRows: 20,
      });

      const manager = new FloorManager(config);
      const retrievedConfig = manager.getFloorSizeConfig();

      expect(retrievedConfig.baseCols).toBe(25);
      expect(retrievedConfig.baseRows).toBe(20);
    });

    it('should return a copy (not the original reference)', () => {
      const config = createFloorSizeConfig({
        baseCols: 25,
      });

      const manager = new FloorManager(config);
      const retrievedConfig = manager.getFloorSizeConfig();

      // Modifying retrieved config should not affect manager
      (retrievedConfig as { baseCols: number }).baseCols = 999;

      const freshConfig = manager.getFloorSizeConfig();
      expect(freshConfig.baseCols).toBe(25);
    });
  });

  describe('reset with custom config', () => {
    it('should maintain custom config after reset', () => {
      const config = createFloorSizeConfig({
        baseCols: 25,
        baseRows: 20,
      });

      const manager = new FloorManager(config);

      // Advance floors
      for (let i = 0; i < 5; i++) {
        manager.nextFloor();
      }

      // Reset
      manager.reset();

      // Should still use custom config
      const dims = manager.getFloorGridDimensions();
      expect(dims.cols).toBe(25);
      expect(dims.rows).toBe(20);
    });
  });

  describe('edge cases', () => {
    it('should handle config where base equals max', () => {
      const config = createFloorSizeConfig({
        baseCols: 20,
        baseRows: 15,
        maxCols: 20,
        maxRows: 15,
        colsPerFloor: 0,
        rowsPerFloor: 0,
        maxFloorForScaling: 1,
      });

      const manager = new FloorManager(config);

      // All floors should have same size
      for (let floor = 1; floor <= 20; floor++) {
        const dims = manager.getFloorGridDimensions();
        expect(dims.cols).toBe(20);
        expect(dims.rows).toBe(15);
        manager.nextFloor();
      }
    });

    it('should handle very small base dimensions', () => {
      const config = createFloorSizeConfig({
        baseCols: 5,
        baseRows: 5,
        maxCols: 50,
        maxRows: 50,
        colsPerFloor: 5,
        rowsPerFloor: 5,
        maxFloorForScaling: 10,
      });

      const manager = new FloorManager(config);
      const dims = manager.getFloorGridDimensions();

      expect(dims.cols).toBe(5);
      expect(dims.rows).toBe(5);
    });

    it('should handle fractional scaling values correctly', () => {
      const config = createFloorSizeConfig({
        baseCols: 10,
        baseRows: 10,
        maxCols: 50,
        maxRows: 50,
        colsPerFloor: 1.5,
        rowsPerFloor: 1.25,
        maxFloorForScaling: 20,
      });

      const manager = new FloorManager(config);

      // Floor 3: 10 + 2*1.5 = 13 cols, 10 + 2*1.25 = 12.5 -> 13 rows (rounded)
      manager.nextFloor(); // floor 2
      manager.nextFloor(); // floor 3

      const dims = manager.getFloorGridDimensions();
      expect(dims.cols).toBe(Math.round(10 + 2 * 1.5));
      expect(dims.rows).toBe(Math.round(10 + 2 * 1.25));
    });
  });
});
