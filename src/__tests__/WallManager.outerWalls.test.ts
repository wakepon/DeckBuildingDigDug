import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WallManager } from '../WallManager';
import { FloorManager } from '../FloorManager';
import { OUTER_WALL_HP, OUTER_WALL_COLOR, TILE_SIZE } from '../constants';

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

describe('WallManager Outer Walls', () => {
  let wallManager: WallManager;
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
    wallManager = new WallManager(floorManager);
  });

  describe('Outer wall creation', () => {
    it('should create walls at x=0 (left edge)', () => {
      const gridDims = wallManager.getGridDimensions();

      for (let y = 0; y < gridDims.rows; y++) {
        const wall = wallManager.getWall(0, y);
        expect(wall).not.toBeNull();
        expect(wall?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should create walls at x=max (right edge)', () => {
      const gridDims = wallManager.getGridDimensions();
      const maxX = gridDims.cols - 1;

      for (let y = 0; y < gridDims.rows; y++) {
        const wall = wallManager.getWall(maxX, y);
        expect(wall).not.toBeNull();
        expect(wall?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should create walls at y=0 (top edge)', () => {
      const gridDims = wallManager.getGridDimensions();

      for (let x = 0; x < gridDims.cols; x++) {
        const wall = wallManager.getWall(x, 0);
        expect(wall).not.toBeNull();
        expect(wall?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should create walls at y=max (bottom edge)', () => {
      const gridDims = wallManager.getGridDimensions();
      const maxY = gridDims.rows - 1;

      for (let x = 0; x < gridDims.cols; x++) {
        const wall = wallManager.getWall(x, maxY);
        expect(wall).not.toBeNull();
        expect(wall?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should create outer walls on all floor sizes', () => {
      // Test on floor 1 (smallest)
      let gridDims = wallManager.getGridDimensions();
      expect(wallManager.getWall(0, 0)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(gridDims.cols - 1, gridDims.rows - 1)?.hp).toBe(OUTER_WALL_HP);

      // Advance to floor 5 (medium size)
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      gridDims = wallManager.getGridDimensions();
      expect(wallManager.getWall(0, 0)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(gridDims.cols - 1, gridDims.rows - 1)?.hp).toBe(OUTER_WALL_HP);

      // Advance to floor 10 (max size)
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      gridDims = wallManager.getGridDimensions();
      expect(wallManager.getWall(0, 0)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(gridDims.cols - 1, gridDims.rows - 1)?.hp).toBe(OUTER_WALL_HP);
    });
  });

  describe('Outer wall indestructibility', () => {
    it('should not destroy outer wall when damaged', () => {
      const wall = wallManager.getWall(0, 0);
      expect(wall).not.toBeNull();
      expect(wall?.hp).toBe(OUTER_WALL_HP);

      // Attempt to damage the outer wall
      const destroyed = wallManager.damageWall(0, 0, 100);

      expect(destroyed).toBe(false);

      // Wall should still exist with same HP
      const wallAfter = wallManager.getWall(0, 0);
      expect(wallAfter).not.toBeNull();
      expect(wallAfter?.hp).toBe(OUTER_WALL_HP);
    });

    it('should not damage outer wall on left edge', () => {
      const gridDims = wallManager.getGridDimensions();

      for (let y = 0; y < gridDims.rows; y++) {
        const destroyed = wallManager.damageWall(0, y, 999);
        expect(destroyed).toBe(false);
        expect(wallManager.getWall(0, y)?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should not damage outer wall on right edge', () => {
      const gridDims = wallManager.getGridDimensions();
      const maxX = gridDims.cols - 1;

      for (let y = 0; y < gridDims.rows; y++) {
        const destroyed = wallManager.damageWall(maxX, y, 999);
        expect(destroyed).toBe(false);
        expect(wallManager.getWall(maxX, y)?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should not damage outer wall on top edge', () => {
      const gridDims = wallManager.getGridDimensions();

      for (let x = 0; x < gridDims.cols; x++) {
        const destroyed = wallManager.damageWall(x, 0, 999);
        expect(destroyed).toBe(false);
        expect(wallManager.getWall(x, 0)?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should not damage outer wall on bottom edge', () => {
      const gridDims = wallManager.getGridDimensions();
      const maxY = gridDims.rows - 1;

      for (let x = 0; x < gridDims.cols; x++) {
        const destroyed = wallManager.damageWall(x, maxY, 999);
        expect(destroyed).toBe(false);
        expect(wallManager.getWall(x, maxY)?.hp).toBe(OUTER_WALL_HP);
      }
    });

    it('should still allow damaging interior walls normally', () => {
      const gridDims = wallManager.getGridDimensions();
      const spawnArea = wallManager.getSpawnArea();

      // Find an interior wall (not on edge, not in spawn area)
      let foundInteriorWall = false;
      for (let x = 1; x < gridDims.cols - 1 && !foundInteriorWall; x++) {
        for (let y = 1; y < gridDims.rows - 1 && !foundInteriorWall; y++) {
          const dx = Math.abs(x - spawnArea.centerX);
          const dy = Math.abs(y - spawnArea.centerY);

          if (dx > spawnArea.radius || dy > spawnArea.radius) {
            const wall = wallManager.getWall(x, y);
            if (wall) {
              // Interior wall should be damageable
              const initialHP = wall.hp;
              expect(initialHP).not.toBe(OUTER_WALL_HP);

              wallManager.damageWall(x, y, 1);
              const wallAfter = wallManager.getWall(x, y);

              if (initialHP === 1) {
                // Wall should be destroyed
                expect(wallAfter).toBeNull();
              } else {
                // Wall should have less HP
                expect(wallAfter?.hp).toBe(initialHP - 1);
              }

              foundInteriorWall = true;
            }
          }
        }
      }

      expect(foundInteriorWall).toBe(true);
    });
  });

  describe('Outer wall color', () => {
    it('should use distinct color for outer walls', () => {
      const color = wallManager.getWallColor(0, 0);
      expect(color).toBe(OUTER_WALL_COLOR);
    });

    it('should use outer wall color on all edges', () => {
      const gridDims = wallManager.getGridDimensions();

      // Check corners
      expect(wallManager.getWallColor(0, 0)).toBe(OUTER_WALL_COLOR);
      expect(wallManager.getWallColor(gridDims.cols - 1, 0)).toBe(OUTER_WALL_COLOR);
      expect(wallManager.getWallColor(0, gridDims.rows - 1)).toBe(OUTER_WALL_COLOR);
      expect(wallManager.getWallColor(gridDims.cols - 1, gridDims.rows - 1)).toBe(OUTER_WALL_COLOR);
    });
  });

  describe('isOuterWall helper', () => {
    it('should return true for walls on edges', () => {
      const gridDims = wallManager.getGridDimensions();

      // Left edge
      expect(wallManager.isOuterWall(0, 5)).toBe(true);

      // Right edge
      expect(wallManager.isOuterWall(gridDims.cols - 1, 5)).toBe(true);

      // Top edge
      expect(wallManager.isOuterWall(5, 0)).toBe(true);

      // Bottom edge
      expect(wallManager.isOuterWall(5, gridDims.rows - 1)).toBe(true);

      // Corners
      expect(wallManager.isOuterWall(0, 0)).toBe(true);
      expect(wallManager.isOuterWall(gridDims.cols - 1, gridDims.rows - 1)).toBe(true);
    });

    it('should return false for interior positions', () => {
      expect(wallManager.isOuterWall(5, 5)).toBe(false);
      expect(wallManager.isOuterWall(3, 3)).toBe(false);
    });
  });

  describe('Spawn area and stairs should not be on outer walls', () => {
    it('should have spawn area inside the outer walls', () => {
      const spawnArea = wallManager.getSpawnArea();
      const gridDims = wallManager.getGridDimensions();

      // Spawn center should not be on any edge
      expect(spawnArea.centerX).toBeGreaterThan(0);
      expect(spawnArea.centerX).toBeLessThan(gridDims.cols - 1);
      expect(spawnArea.centerY).toBeGreaterThan(0);
      expect(spawnArea.centerY).toBeLessThan(gridDims.rows - 1);
    });

    it('should have stairs inside the outer walls', () => {
      const stairsPos = wallManager.stairsPosition;
      const gridDims = wallManager.getGridDimensions();

      // Stairs should not be on edges
      expect(stairsPos.x).toBeGreaterThan(0);
      expect(stairsPos.x).toBeLessThan(gridDims.cols - 1);
      expect(stairsPos.y).toBeGreaterThan(0);
      expect(stairsPos.y).toBeLessThan(gridDims.rows - 1);
    });
  });

  describe('Outer walls persist after reset', () => {
    it('should recreate outer walls after reset', () => {
      // Advance floors
      for (let i = 0; i < 3; i++) {
        floorManager.nextFloor();
      }
      wallManager.reset();

      const gridDims = wallManager.getGridDimensions();

      // Check outer walls still exist
      expect(wallManager.getWall(0, 0)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(gridDims.cols - 1, 0)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(0, gridDims.rows - 1)?.hp).toBe(OUTER_WALL_HP);
      expect(wallManager.getWall(gridDims.cols - 1, gridDims.rows - 1)?.hp).toBe(OUTER_WALL_HP);
    });
  });
});

describe('OUTER_WALL_HP constant', () => {
  it('should be a special value (-1) for indestructibility', () => {
    expect(OUTER_WALL_HP).toBe(-1);
  });
});

describe('OUTER_WALL_COLOR constant', () => {
  it('should be defined and be a number (hex color)', () => {
    expect(typeof OUTER_WALL_COLOR).toBe('number');
  });

  it('should be a dark color (low RGB values)', () => {
    // Extract RGB components
    const r = (OUTER_WALL_COLOR >> 16) & 0xff;
    const g = (OUTER_WALL_COLOR >> 8) & 0xff;
    const b = OUTER_WALL_COLOR & 0xff;

    // All components should be relatively low (dark color)
    expect(r).toBeLessThan(80);
    expect(g).toBeLessThan(80);
    expect(b).toBeLessThan(80);
  });
});
