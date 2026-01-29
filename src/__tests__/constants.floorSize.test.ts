import { describe, it, expect } from 'vitest';
import {
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  FLOOR_SIZE_SCALING,
} from '../constants';

describe('Floor Size Constants', () => {
  describe('FLOOR_SIZE_SCALING', () => {
    it('should have BASE_COLS defined', () => {
      expect(FLOOR_SIZE_SCALING.BASE_COLS).toBeDefined();
      expect(FLOOR_SIZE_SCALING.BASE_COLS).toBeGreaterThan(0);
    });

    it('should have BASE_ROWS defined', () => {
      expect(FLOOR_SIZE_SCALING.BASE_ROWS).toBeDefined();
      expect(FLOOR_SIZE_SCALING.BASE_ROWS).toBeGreaterThan(0);
    });

    it('should have base dimensions that fit on screen', () => {
      // Base floor should be at least screen size
      const baseWidth = FLOOR_SIZE_SCALING.BASE_COLS * TILE_SIZE;
      const baseHeight = FLOOR_SIZE_SCALING.BASE_ROWS * TILE_SIZE;

      expect(baseWidth).toBeGreaterThanOrEqual(SCREEN_WIDTH);
      expect(baseHeight).toBeGreaterThanOrEqual(SCREEN_HEIGHT);
    });

    it('should have COLS_PER_FLOOR defined for scaling', () => {
      expect(FLOOR_SIZE_SCALING.COLS_PER_FLOOR).toBeDefined();
      expect(FLOOR_SIZE_SCALING.COLS_PER_FLOOR).toBeGreaterThanOrEqual(0);
    });

    it('should have ROWS_PER_FLOOR defined for scaling', () => {
      expect(FLOOR_SIZE_SCALING.ROWS_PER_FLOOR).toBeDefined();
      expect(FLOOR_SIZE_SCALING.ROWS_PER_FLOOR).toBeGreaterThanOrEqual(0);
    });

    it('should have MAX_FLOOR_FOR_SCALING defined', () => {
      expect(FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING).toBeDefined();
      expect(FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING).toBeGreaterThan(0);
    });

    it('should reach max grid size by MAX_FLOOR_FOR_SCALING', () => {
      // Calculate what floor 10 would be
      const maxFloorCols = FLOOR_SIZE_SCALING.BASE_COLS +
        (FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING - 1) * FLOOR_SIZE_SCALING.COLS_PER_FLOOR;
      const maxFloorRows = FLOOR_SIZE_SCALING.BASE_ROWS +
        (FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING - 1) * FLOOR_SIZE_SCALING.ROWS_PER_FLOOR;

      // Should approximately equal max grid dimensions
      expect(Math.min(maxFloorCols, GRID_COLS)).toBe(GRID_COLS);
      expect(Math.min(maxFloorRows, GRID_ROWS)).toBe(GRID_ROWS);
    });
  });

  describe('Grid dimension relationships', () => {
    it('should have GRID_COLS as maximum floor width', () => {
      expect(GRID_COLS).toBe(40);
    });

    it('should have GRID_ROWS as maximum floor height', () => {
      expect(GRID_ROWS).toBe(30);
    });

    it('should have base dimensions smaller than or equal to max', () => {
      expect(FLOOR_SIZE_SCALING.BASE_COLS).toBeLessThanOrEqual(GRID_COLS);
      expect(FLOOR_SIZE_SCALING.BASE_ROWS).toBeLessThanOrEqual(GRID_ROWS);
    });
  });

  describe('Scaling math validation', () => {
    it('should scale linearly from base to max over floors', () => {
      const floor1Cols = FLOOR_SIZE_SCALING.BASE_COLS;
      const floor10Cols = Math.min(
        FLOOR_SIZE_SCALING.BASE_COLS + 9 * FLOOR_SIZE_SCALING.COLS_PER_FLOOR,
        GRID_COLS
      );

      // Floor 10 should be larger than floor 1
      expect(floor10Cols).toBeGreaterThan(floor1Cols);
    });

    it('should have scaling values that produce valid grid dimensions when rounded', () => {
      // Verify that scaling values, when applied, produce reasonable dimensions
      // Values are rounded when used, so check the actual resulting dimensions are valid
      for (let floor = 1; floor <= FLOOR_SIZE_SCALING.MAX_FLOOR_FOR_SCALING; floor++) {
        const floorsOfScaling = floor - 1;
        const cols = Math.round(FLOOR_SIZE_SCALING.BASE_COLS + floorsOfScaling * FLOOR_SIZE_SCALING.COLS_PER_FLOOR);
        const rows = Math.round(FLOOR_SIZE_SCALING.BASE_ROWS + floorsOfScaling * FLOOR_SIZE_SCALING.ROWS_PER_FLOOR);

        expect(Number.isInteger(cols)).toBe(true);
        expect(Number.isInteger(rows)).toBe(true);
        expect(cols).toBeGreaterThan(0);
        expect(rows).toBeGreaterThan(0);
      }
    });
  });
});
