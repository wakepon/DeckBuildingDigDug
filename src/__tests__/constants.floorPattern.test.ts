import { describe, it, expect } from 'vitest';
import { FLOOR_PATTERN, TILE_SIZE } from '../constants';

describe('FLOOR_PATTERN constants', () => {
  describe('color values', () => {
    it('should have a dark blue-gray base color', () => {
      expect(FLOOR_PATTERN.BASE_COLOR).toBe(0x1a1a2e);
    });

    it('should have a darker grout color than base', () => {
      // Grout should be darker than base
      const baseR = (FLOOR_PATTERN.BASE_COLOR >> 16) & 0xff;
      const groutR = (FLOOR_PATTERN.GROUT_COLOR >> 16) & 0xff;
      expect(groutR).toBeLessThan(baseR);
    });

    it('should have a lighter highlight color than base', () => {
      // Highlight should be lighter than base
      const baseR = (FLOOR_PATTERN.BASE_COLOR >> 16) & 0xff;
      const highlightR = (FLOOR_PATTERN.HIGHLIGHT_COLOR >> 16) & 0xff;
      expect(highlightR).toBeGreaterThan(baseR);
    });

    it('should have valid hex color values', () => {
      expect(FLOOR_PATTERN.BASE_COLOR).toBeGreaterThanOrEqual(0);
      expect(FLOOR_PATTERN.BASE_COLOR).toBeLessThanOrEqual(0xffffff);

      expect(FLOOR_PATTERN.GROUT_COLOR).toBeGreaterThanOrEqual(0);
      expect(FLOOR_PATTERN.GROUT_COLOR).toBeLessThanOrEqual(0xffffff);

      expect(FLOOR_PATTERN.HIGHLIGHT_COLOR).toBeGreaterThanOrEqual(0);
      expect(FLOOR_PATTERN.HIGHLIGHT_COLOR).toBeLessThanOrEqual(0xffffff);
    });
  });

  describe('grout width', () => {
    it('should have a positive grout width', () => {
      expect(FLOOR_PATTERN.GROUT_WIDTH).toBeGreaterThan(0);
    });

    it('should have grout width smaller than tile size', () => {
      expect(FLOOR_PATTERN.GROUT_WIDTH).toBeLessThan(TILE_SIZE);
    });

    it('should leave room for visible tiles', () => {
      // Tile size minus grout should leave reasonable space for tiles
      const tileVisibleSize = TILE_SIZE - FLOOR_PATTERN.GROUT_WIDTH;
      expect(tileVisibleSize).toBeGreaterThan(TILE_SIZE / 2);
    });
  });

  describe('color variation', () => {
    it('should have a small color variation value', () => {
      expect(FLOOR_PATTERN.COLOR_VARIATION).toBeGreaterThan(0);
      expect(FLOOR_PATTERN.COLOR_VARIATION).toBeLessThanOrEqual(0x101010);
    });
  });

  describe('highlight alpha', () => {
    it('should have highlight alpha between 0 and 1', () => {
      expect(FLOOR_PATTERN.HIGHLIGHT_ALPHA).toBeGreaterThan(0);
      expect(FLOOR_PATTERN.HIGHLIGHT_ALPHA).toBeLessThanOrEqual(1);
    });

    it('should be subtle (less than 0.5)', () => {
      expect(FLOOR_PATTERN.HIGHLIGHT_ALPHA).toBeLessThan(0.5);
    });
  });
});
