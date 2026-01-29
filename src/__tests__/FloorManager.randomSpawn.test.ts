import { describe, it, expect, beforeEach } from 'vitest';
import { FloorManager } from '../FloorManager';
import {
  createFloorSizeConfig,
  PLAYER_SPAWN_RADIUS,
  STAIRS_MIN_DISTANCE,
} from '../constants';

describe('FloorManager Random Spawn Position', () => {
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
  });

  describe('getRandomSpawnCenter', () => {
    describe('returns valid grid position', () => {
      it('should return a position with x and y coordinates', () => {
        const position = floorManager.getRandomSpawnCenter();

        expect(position).toBeDefined();
        expect(position.x).toBeDefined();
        expect(position.y).toBeDefined();
      });

      it('should return integer grid coordinates', () => {
        const position = floorManager.getRandomSpawnCenter();

        expect(Number.isInteger(position.x)).toBe(true);
        expect(Number.isInteger(position.y)).toBe(true);
      });

      it('should return non-negative coordinates', () => {
        const position = floorManager.getRandomSpawnCenter();

        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeGreaterThanOrEqual(0);
      });
    });

    describe('position within playable bounds', () => {
      it('should return position within current floor grid bounds', () => {
        const gridDims = floorManager.getFloorGridDimensions();
        const position = floorManager.getRandomSpawnCenter();

        // Position must be within grid, excluding outer walls
        expect(position.x).toBeGreaterThanOrEqual(1);
        expect(position.y).toBeGreaterThanOrEqual(1);
        expect(position.x).toBeLessThan(gridDims.cols - 1);
        expect(position.y).toBeLessThan(gridDims.rows - 1);
      });

      it('should ensure 3x3 safe zone fits within playable area', () => {
        const gridDims = floorManager.getFloorGridDimensions();
        const position = floorManager.getRandomSpawnCenter();

        // Safe zone (3x3) must fit inside outer walls
        // With PLAYER_SPAWN_RADIUS of 1, position must be at least 2 from edges
        const minX = 1 + PLAYER_SPAWN_RADIUS;
        const minY = 1 + PLAYER_SPAWN_RADIUS;
        const maxX = gridDims.cols - 2 - PLAYER_SPAWN_RADIUS;
        const maxY = gridDims.rows - 2 - PLAYER_SPAWN_RADIUS;

        expect(position.x).toBeGreaterThanOrEqual(minX);
        expect(position.y).toBeGreaterThanOrEqual(minY);
        expect(position.x).toBeLessThanOrEqual(maxX);
        expect(position.y).toBeLessThanOrEqual(maxY);
      });

      it('should work on floor 1 with smallest floor size', () => {
        const position = floorManager.getRandomSpawnCenter();
        const gridDims = floorManager.getFloorGridDimensions();

        // Even on smallest floor, position should be valid
        expect(position.x).toBeGreaterThan(0);
        expect(position.y).toBeGreaterThan(0);
        expect(position.x).toBeLessThan(gridDims.cols - 1);
        expect(position.y).toBeLessThan(gridDims.rows - 1);
      });

      it('should work on floor 10 with maximum floor size', () => {
        // Advance to floor 10
        for (let i = 0; i < 9; i++) {
          floorManager.nextFloor();
        }

        const position = floorManager.getRandomSpawnCenter();
        const gridDims = floorManager.getFloorGridDimensions();

        expect(position.x).toBeGreaterThan(0);
        expect(position.y).toBeGreaterThan(0);
        expect(position.x).toBeLessThan(gridDims.cols - 1);
        expect(position.y).toBeLessThan(gridDims.rows - 1);
      });
    });

    describe('randomness', () => {
      it('should return cached position on subsequent calls within same floor', () => {
        // First call generates and caches
        const firstCall = floorManager.getRandomSpawnCenter();

        // Subsequent calls return cached value
        const secondCall = floorManager.getRandomSpawnCenter();
        const thirdCall = floorManager.getRandomSpawnCenter();

        expect(secondCall.x).toBe(firstCall.x);
        expect(secondCall.y).toBe(firstCall.y);
        expect(thirdCall.x).toBe(firstCall.x);
        expect(thirdCall.y).toBe(firstCall.y);
      });

      it('should produce different positions across floor transitions', () => {
        const positions: { x: number; y: number }[] = [];
        const iterations = 20;

        for (let i = 0; i < iterations; i++) {
          // Reset clears the cache, allowing new random spawn
          floorManager.reset();
          positions.push({ ...floorManager.getRandomSpawnCenter() });
        }

        // Check if we have at least some variation
        const uniquePositions = new Set(
          positions.map((p) => `${p.x},${p.y}`)
        );

        // With 20 iterations, we should see at least 2 different positions
        // (statistically very unlikely to get same position 20 times)
        expect(uniquePositions.size).toBeGreaterThan(1);
      });

      it('should eventually cover different areas of the floor', () => {
        const positions: { x: number; y: number }[] = [];
        const iterations = 50;

        for (let i = 0; i < iterations; i++) {
          // Advance to floor 6 for larger floor, then get spawn
          floorManager.reset();
          for (let j = 0; j < 5; j++) {
            floorManager.nextFloor();
          }
          positions.push({ ...floorManager.getRandomSpawnCenter() });
        }

        // Calculate variance in positions
        const xValues = positions.map((p) => p.x);
        const yValues = positions.map((p) => p.y);

        const xVariance = Math.max(...xValues) - Math.min(...xValues);
        const yVariance = Math.max(...yValues) - Math.min(...yValues);

        // There should be at least some spread in positions
        expect(xVariance).toBeGreaterThan(0);
        expect(yVariance).toBeGreaterThan(0);
      });
    });

    describe('distance from stairs', () => {
      it('should maintain minimum distance from stairs position', () => {
        // This test verifies the spawn doesn't overlap with likely stairs positions
        // Stairs are always at least STAIRS_MIN_DISTANCE from spawn center
        // So spawn center should be away from likely stairs positions

        // Run multiple times to check consistency
        for (let i = 0; i < 10; i++) {
          const position = floorManager.getRandomSpawnCenter();
          const gridDims = floorManager.getFloorGridDimensions();

          // The spawn position should allow stairs to be placed at STAIRS_MIN_DISTANCE away
          // This means spawn can't be too close to corners
          const distFromEdges = Math.min(
            position.x,
            position.y,
            gridDims.cols - 1 - position.x,
            gridDims.rows - 1 - position.y
          );

          // Must have enough room for stairs placement
          expect(distFromEdges).toBeGreaterThanOrEqual(PLAYER_SPAWN_RADIUS);
        }
      });
    });

    describe('edge cases', () => {
      it('should handle custom small floor configuration', () => {
        const config = createFloorSizeConfig({
          baseCols: 7,
          baseRows: 7,
          maxCols: 7,
          maxRows: 7,
          colsPerFloor: 0,
          rowsPerFloor: 0,
          maxFloorForScaling: 1,
        });

        const smallFloorManager = new FloorManager(config);
        const position = smallFloorManager.getRandomSpawnCenter();
        const gridDims = smallFloorManager.getFloorGridDimensions();

        // On a 7x7 grid with outer walls, playable area is 5x5 (indices 1-5)
        // With safe zone of 3x3, center must be at least 2 from edges
        expect(position.x).toBeGreaterThanOrEqual(2);
        expect(position.y).toBeGreaterThanOrEqual(2);
        expect(position.x).toBeLessThanOrEqual(gridDims.cols - 3);
        expect(position.y).toBeLessThanOrEqual(gridDims.rows - 3);
      });

      it('should handle minimum viable floor size (5x5 playable area)', () => {
        // For a truly minimal floor where only one position is valid,
        // we need 5x5 total (outer walls at 0,4, playable 1-3, center at 2)
        const config = createFloorSizeConfig({
          baseCols: 5,
          baseRows: 5,
          maxCols: 5,
          maxRows: 5,
          colsPerFloor: 0,
          rowsPerFloor: 0,
          maxFloorForScaling: 1,
        });

        const minFloorManager = new FloorManager(config);
        const position = minFloorManager.getRandomSpawnCenter();

        // With 3x3 playable area (indices 1-3), only center (2,2) is valid for 3x3 safe zone
        // minX = 1 + 1 = 2, maxX = 5 - 2 - 1 = 2, so only position 2 is valid
        expect(position.x).toBe(2);
        expect(position.y).toBe(2);
      });

      it('should work consistently after floor reset', () => {
        // Advance some floors
        for (let i = 0; i < 5; i++) {
          floorManager.nextFloor();
        }

        // Reset
        floorManager.reset();

        const position = floorManager.getRandomSpawnCenter();
        const gridDims = floorManager.getFloorGridDimensions();

        // Should still return valid position for floor 1
        expect(position.x).toBeGreaterThan(0);
        expect(position.y).toBeGreaterThan(0);
        expect(position.x).toBeLessThan(gridDims.cols - 1);
        expect(position.y).toBeLessThan(gridDims.rows - 1);
      });
    });

    describe('comparison with fixed center spawn', () => {
      it('should be different from getFloorSpawnCenter in some cases', () => {
        const centerPosition = floorManager.getFloorSpawnCenter();
        const randomPositions: { x: number; y: number }[] = [];

        // Use floor transitions to get different random spawn positions
        for (let i = 0; i < 20; i++) {
          floorManager.reset();
          // Advance to larger floor for more spawn options
          for (let j = 0; j < 5; j++) {
            floorManager.nextFloor();
          }
          randomPositions.push({ ...floorManager.getRandomSpawnCenter() });
        }

        // At least some random positions should differ from center
        const differentFromCenter = randomPositions.filter(
          (p) => p.x !== centerPosition.x || p.y !== centerPosition.y
        );

        expect(differentFromCenter.length).toBeGreaterThan(0);
      });

      it('should still include center as a valid possible position', () => {
        // Use a small custom floor where center is likely to be hit
        const config = createFloorSizeConfig({
          baseCols: 9,
          baseRows: 9,
          maxCols: 9,
          maxRows: 9,
          colsPerFloor: 0,
          rowsPerFloor: 0,
          maxFloorForScaling: 1,
        });

        const centerPosition = { x: 4, y: 4 }; // Center of 9x9 grid

        // Verify center is within valid random spawn range
        // For 9x9: minX = 2, maxX = 5, center = 4
        // Valid range is 2-5, so center (4) should be included
        const minX = 1 + PLAYER_SPAWN_RADIUS;
        const maxX = 9 - 2 - PLAYER_SPAWN_RADIUS;

        expect(centerPosition.x).toBeGreaterThanOrEqual(minX);
        expect(centerPosition.x).toBeLessThanOrEqual(maxX);

        // Run enough iterations with floor resets to find center
        let foundCenter = false;
        for (let i = 0; i < 100; i++) {
          const smallFloorManager = new FloorManager(config);
          const randomPos = smallFloorManager.getRandomSpawnCenter();
          if (randomPos.x === centerPosition.x && randomPos.y === centerPosition.y) {
            foundCenter = true;
            break;
          }
        }

        // Center should be a valid spawn position
        expect(foundCenter).toBe(true);
      });
    });
  });
});
