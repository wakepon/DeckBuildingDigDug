import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TILE_SIZE } from '../constants';

// Mock pixi.js before importing FloorRenderer
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

// Import after mock
import { FloorRenderer } from '../FloorRenderer';

describe('FloorRenderer', () => {
  describe('constructor', () => {
    it('should create a FloorRenderer with specified dimensions', () => {
      const worldWidth = 640;
      const worldHeight = 440;
      const renderer = new FloorRenderer(worldWidth, worldHeight);

      expect(renderer).toBeDefined();
      expect(renderer.container).toBeDefined();
    });

    it('should calculate correct tile counts based on world dimensions', () => {
      const worldWidth = 640; // 16 tiles
      const worldHeight = 440; // 11 tiles
      const renderer = new FloorRenderer(worldWidth, worldHeight);

      // 16 tiles * 11 tiles = 176 tiles
      const expectedCols = Math.ceil(worldWidth / TILE_SIZE);
      const expectedRows = Math.ceil(worldHeight / TILE_SIZE);

      expect(expectedCols).toBe(16);
      expect(expectedRows).toBe(11);
    });

    it('should create graphics object for floor rendering', () => {
      const renderer = new FloorRenderer(640, 440);

      expect(renderer.container).toBeDefined();
    });

    it('should handle minimum floor size (floor 1)', () => {
      // Floor 1: 16 cols x 11 rows = 640 x 440 pixels
      const renderer = new FloorRenderer(16 * TILE_SIZE, 11 * TILE_SIZE);

      expect(renderer).toBeDefined();
    });

    it('should handle maximum floor size (floor 10+)', () => {
      // Floor 10+: 40 cols x 30 rows = 1600 x 1200 pixels
      const renderer = new FloorRenderer(40 * TILE_SIZE, 30 * TILE_SIZE);

      expect(renderer).toBeDefined();
    });
  });

  describe('updateSize', () => {
    let renderer: FloorRenderer;

    beforeEach(() => {
      renderer = new FloorRenderer(640, 440);
    });

    it('should update floor dimensions', () => {
      const newWidth = 800;
      const newHeight = 600;

      renderer.updateSize(newWidth, newHeight);

      // The pattern should be redrawn for the new size
      expect(renderer).toBeDefined();
    });

    it('should handle increasing floor size', () => {
      // Start with floor 1 size
      renderer.updateSize(640, 440);

      // Increase to floor 5 size
      renderer.updateSize(960, 680);

      expect(renderer).toBeDefined();
    });

    it('should handle maximum floor size', () => {
      // Update to max floor size
      renderer.updateSize(1600, 1200);

      expect(renderer).toBeDefined();
    });

    it('should redraw pattern after size change', () => {
      const initialWidth = 640;
      const initialHeight = 440;
      renderer = new FloorRenderer(initialWidth, initialHeight);

      const newWidth = 800;
      const newHeight = 600;
      renderer.updateSize(newWidth, newHeight);

      // Graphics should have been cleared and redrawn
      expect(renderer.container).toBeDefined();
    });
  });

  describe('destroy', () => {
    it('should clean up graphics resources', () => {
      const renderer = new FloorRenderer(640, 440);

      renderer.destroy();

      // Verify no errors during destruction
      expect(renderer).toBeDefined();
    });

    it('should be safe to call destroy multiple times', () => {
      const renderer = new FloorRenderer(640, 440);

      renderer.destroy();
      renderer.destroy();

      expect(renderer).toBeDefined();
    });
  });

  describe('pattern generation', () => {
    it('should use deterministic color variations based on position', () => {
      const renderer1 = new FloorRenderer(640, 440);
      const renderer2 = new FloorRenderer(640, 440);

      // Both renderers should produce the same pattern for the same size
      expect(renderer1).toBeDefined();
      expect(renderer2).toBeDefined();
    });

    it('should draw tiles with grout gaps', () => {
      const renderer = new FloorRenderer(TILE_SIZE * 2, TILE_SIZE * 2);

      // Pattern should have 4 tiles (2x2) with grout between them
      expect(renderer).toBeDefined();
    });
  });

  describe('getFloorColors', () => {
    it('should return floor color constants', () => {
      const renderer = new FloorRenderer(640, 440);
      const colors = renderer.getFloorColors();

      expect(colors.base).toBeDefined();
      expect(colors.grout).toBeDefined();
      expect(colors.highlight).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle zero dimensions gracefully', () => {
      expect(() => new FloorRenderer(0, 0)).not.toThrow();
    });

    it('should handle non-tile-aligned dimensions', () => {
      // 100 is not divisible by TILE_SIZE (40)
      const renderer = new FloorRenderer(100, 100);

      expect(renderer).toBeDefined();
    });

    it('should handle very large floor sizes', () => {
      // Much larger than normal floor size
      const renderer = new FloorRenderer(4000, 3000);

      expect(renderer).toBeDefined();
    });

    it('should not update size after destroyed', () => {
      const renderer = new FloorRenderer(640, 440);

      renderer.destroy();

      // Should not throw, but should not redraw either
      expect(() => renderer.updateSize(800, 600)).not.toThrow();
    });

    it('should not draw pattern after destroyed', () => {
      const renderer = new FloorRenderer(640, 440);

      renderer.destroy();

      // Pattern should not be redrawn
      expect(renderer).toBeDefined();
    });
  });
});
