import { describe, it, expect } from 'vitest';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  GRID_COLS,
  GRID_ROWS,
  TILE_SIZE,
} from '../constants';

describe('World Size Constants', () => {
  describe('grid dimensions', () => {
    it('should have GRID_COLS of 40 for larger world', () => {
      expect(GRID_COLS).toBe(40);
    });

    it('should have GRID_ROWS of 30 for larger world', () => {
      expect(GRID_ROWS).toBe(30);
    });
  });

  describe('world dimensions calculation', () => {
    it('should calculate WORLD_WIDTH as GRID_COLS * TILE_SIZE', () => {
      expect(WORLD_WIDTH).toBe(GRID_COLS * TILE_SIZE);
    });

    it('should calculate WORLD_HEIGHT as GRID_ROWS * TILE_SIZE', () => {
      expect(WORLD_HEIGHT).toBe(GRID_ROWS * TILE_SIZE);
    });
  });

  describe('camera scrolling requirement', () => {
    it('should have WORLD_WIDTH larger than SCREEN_WIDTH for horizontal scrolling', () => {
      expect(WORLD_WIDTH).toBeGreaterThan(SCREEN_WIDTH);
    });

    it('should have WORLD_HEIGHT larger than SCREEN_HEIGHT for vertical scrolling', () => {
      expect(WORLD_HEIGHT).toBeGreaterThan(SCREEN_HEIGHT);
    });

    it('should have world at least 2x screen size for meaningful scrolling', () => {
      expect(WORLD_WIDTH).toBeGreaterThanOrEqual(SCREEN_WIDTH * 2);
      expect(WORLD_HEIGHT).toBeGreaterThanOrEqual(SCREEN_HEIGHT * 2);
    });
  });

  describe('screen dimensions unchanged', () => {
    it('should keep SCREEN_WIDTH at 800', () => {
      expect(SCREEN_WIDTH).toBe(800);
    });

    it('should keep SCREEN_HEIGHT at 600', () => {
      expect(SCREEN_HEIGHT).toBe(600);
    });
  });

  describe('tile size unchanged', () => {
    it('should keep TILE_SIZE at 40', () => {
      expect(TILE_SIZE).toBe(40);
    });
  });
});
