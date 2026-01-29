import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TILE_SIZE, PLAYER_SPAWN_CENTER_X, PLAYER_SPAWN_CENTER_Y } from '../constants';

// Mock pixi.js
vi.mock('pixi.js', () => ({
  Container: class {
    children: unknown[] = [];
    addChild(child: unknown) { this.children.push(child); }
    removeChild(child: unknown) {
      const idx = this.children.indexOf(child);
      if (idx >= 0) this.children.splice(idx, 1);
    }
  },
  Graphics: class {
    x = 0;
    y = 0;
    clear() { return this; }
    rect() { return this; }
    fill() { return this; }
    stroke() { return this; }
    moveTo() { return this; }
    lineTo() { return this; }
    destroy() {}
  },
}));

import { WallManager } from '../WallManager';

describe('WallManager - Auto-aim support', () => {
  let wallManager: WallManager;

  beforeEach(() => {
    wallManager = new WallManager();
  });

  describe('getWallCenters', () => {
    it('should return an array', () => {
      const centers = wallManager.getWallCenters();
      expect(Array.isArray(centers)).toBe(true);
    });

    it('should return objects with x and y properties', () => {
      const centers = wallManager.getWallCenters();

      // Should have at least some walls (grid minus spawn area)
      expect(centers.length).toBeGreaterThan(0);

      for (const center of centers) {
        expect(typeof center.x).toBe('number');
        expect(typeof center.y).toBe('number');
      }
    });

    it('should return wall center positions (not grid positions)', () => {
      const centers = wallManager.getWallCenters();

      // Centers should be in pixel coordinates, at tile centers
      for (const center of centers) {
        // Center X should be at grid position + half tile
        const gridX = Math.floor(center.x / TILE_SIZE);
        const expectedCenterX = (gridX + 0.5) * TILE_SIZE;
        expect(center.x).toBe(expectedCenterX);

        // Center Y should be at grid position + half tile
        const gridY = Math.floor(center.y / TILE_SIZE);
        const expectedCenterY = (gridY + 0.5) * TILE_SIZE;
        expect(center.y).toBe(expectedCenterY);
      }
    });

    it('should not include spawn area positions', () => {
      const centers = wallManager.getWallCenters();

      // Spawn area is around grid center with radius 1 (3x3)
      // Use constants for spawn center position
      const spawnAreaCenterX = PLAYER_SPAWN_CENTER_X * TILE_SIZE + TILE_SIZE / 2;
      const spawnAreaCenterY = PLAYER_SPAWN_CENTER_Y * TILE_SIZE + TILE_SIZE / 2;

      // None of the returned centers should be in the spawn area
      for (const center of centers) {
        const dx = Math.abs(center.x - spawnAreaCenterX);
        const dy = Math.abs(center.y - spawnAreaCenterY);
        // If within spawn radius in both dimensions, it would be spawn area
        const inSpawnArea = dx <= TILE_SIZE && dy <= TILE_SIZE;
        expect(inSpawnArea).toBe(false);
      }
    });

    it('should update when walls are destroyed', () => {
      const initialCenters = wallManager.getWallCenters();
      const initialCount = initialCenters.length;

      // Find a valid wall position and destroy it
      if (initialCenters.length > 0) {
        const firstCenter = initialCenters[0];
        const gridX = Math.floor(firstCenter.x / TILE_SIZE);
        const gridY = Math.floor(firstCenter.y / TILE_SIZE);

        // Damage the wall until destroyed
        const wall = wallManager.getWall(gridX, gridY);
        if (wall) {
          wallManager.damageWall(gridX, gridY, wall.hp);
        }

        const newCenters = wallManager.getWallCenters();
        expect(newCenters.length).toBe(initialCount - 1);
      }
    });
  });
});
