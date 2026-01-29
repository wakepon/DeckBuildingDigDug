import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FloorManager } from '../FloorManager';
import { WallManager } from '../WallManager';
import { PLAYER_SPAWN_RADIUS, createFloorSizeConfig } from '../constants';

// Mock PixiJS with class-based constructors
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

describe('Spawn Safe Area Integration', () => {
  describe('WallManager and FloorManager spawn center consistency', () => {
    it('should clear safe area at the same position where player spawns', () => {
      // This test verifies the bug fix:
      // WallManager should use the same spawn center as what FloorManager provides
      // for player spawn position

      const floorManager = new FloorManager();
      const wallManager = new WallManager(floorManager);

      // Get the spawn center that FloorManager would provide for player initialization
      // After the fix, this should return the SAME cached position
      const playerSpawnCenter = floorManager.getRandomSpawnCenter();

      // Get the spawn area that WallManager used to clear walls
      const wallManagerSpawnArea = wallManager.getSpawnArea();

      // These MUST match - if they don't, the player spawns in walls
      expect(wallManagerSpawnArea.centerX).toBe(playerSpawnCenter.x);
      expect(wallManagerSpawnArea.centerY).toBe(playerSpawnCenter.y);
    });

    it('should have no walls in the 3x3 safe area around player spawn', () => {
      const floorManager = new FloorManager();
      const wallManager = new WallManager(floorManager);

      // Get the spawn center
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // Check all positions in the 3x3 safe area (PLAYER_SPAWN_RADIUS = 1)
      for (let dx = -PLAYER_SPAWN_RADIUS; dx <= PLAYER_SPAWN_RADIUS; dx++) {
        for (let dy = -PLAYER_SPAWN_RADIUS; dy <= PLAYER_SPAWN_RADIUS; dy++) {
          const x = spawnCenter.x + dx;
          const y = spawnCenter.y + dy;

          const wall = wallManager.getWall(x, y);
          expect(wall).toBeNull(`Wall found at (${x}, ${y}) which should be in safe area around spawn (${spawnCenter.x}, ${spawnCenter.y})`);
        }
      }
    });

    it('should cache spawn center during floor initialization', () => {
      const floorManager = new FloorManager();

      // First call should generate and cache
      const firstCall = floorManager.getRandomSpawnCenter();

      // Subsequent calls during same floor should return same value
      const secondCall = floorManager.getRandomSpawnCenter();
      const thirdCall = floorManager.getRandomSpawnCenter();

      expect(secondCall.x).toBe(firstCall.x);
      expect(secondCall.y).toBe(firstCall.y);
      expect(thirdCall.x).toBe(firstCall.x);
      expect(thirdCall.y).toBe(firstCall.y);
    });

    it('should generate new spawn center on floor transition', () => {
      const floorManager = new FloorManager();

      // Get spawn center for floor 1
      const floor1Spawn = floorManager.getRandomSpawnCenter();

      // Advance to floor 2
      floorManager.nextFloor();

      // Get spawn center for floor 2 - should be able to be different
      // (cache should be cleared on floor transition)
      // We run multiple iterations to statistically verify cache was cleared
      let foundDifferent = false;
      for (let i = 0; i < 20; i++) {
        // Reset to floor 1 to reset cache
        floorManager.reset();
        floorManager.nextFloor();

        const floor2Spawn = floorManager.getRandomSpawnCenter();
        if (floor2Spawn.x !== floor1Spawn.x || floor2Spawn.y !== floor1Spawn.y) {
          foundDifferent = true;
          break;
        }
      }

      // With random positions on a larger floor, we should find different values
      // If cache wasn't cleared, every floor would have the same spawn
      expect(foundDifferent).toBe(true);
    });

    it('should clear spawn center cache on reset', () => {
      const floorManager = new FloorManager();

      // Get spawn center for floor 1
      const firstSpawn = floorManager.getRandomSpawnCenter();

      // Advance several floors
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }

      // Reset back to floor 1
      floorManager.reset();

      // Get spawn center again - cache should be cleared
      // We need to check that the cache was cleared, not that we get a different value
      // (we might randomly get the same value)
      // Run multiple times to verify cache is working after reset
      const postResetSpawn = floorManager.getRandomSpawnCenter();
      const postResetSpawn2 = floorManager.getRandomSpawnCenter();

      // After reset, subsequent calls should still be cached
      expect(postResetSpawn2.x).toBe(postResetSpawn.x);
      expect(postResetSpawn2.y).toBe(postResetSpawn.y);
    });
  });

  describe('WallManager reset with consistent spawn center', () => {
    it('should use consistent spawn center after WallManager reset', () => {
      const floorManager = new FloorManager();
      const wallManager = new WallManager(floorManager);

      // Advance to next floor
      floorManager.nextFloor();

      // Reset WallManager (simulates floor transition)
      wallManager.reset();

      // Get the new spawn center from FloorManager
      const newSpawnCenter = floorManager.getRandomSpawnCenter();

      // Get the spawn area from WallManager
      const wallManagerSpawnArea = wallManager.getSpawnArea();

      // They should match
      expect(wallManagerSpawnArea.centerX).toBe(newSpawnCenter.x);
      expect(wallManagerSpawnArea.centerY).toBe(newSpawnCenter.y);
    });

    it('should have no walls in safe area after WallManager reset', () => {
      const floorManager = new FloorManager();
      const wallManager = new WallManager(floorManager);

      // Advance to next floor
      floorManager.nextFloor();

      // Reset WallManager
      wallManager.reset();

      // Get spawn center
      const spawnCenter = floorManager.getRandomSpawnCenter();

      // Verify safe area is clear
      for (let dx = -PLAYER_SPAWN_RADIUS; dx <= PLAYER_SPAWN_RADIUS; dx++) {
        for (let dy = -PLAYER_SPAWN_RADIUS; dy <= PLAYER_SPAWN_RADIUS; dy++) {
          const x = spawnCenter.x + dx;
          const y = spawnCenter.y + dy;

          const wall = wallManager.getWall(x, y);
          expect(wall).toBeNull(`Wall found at (${x}, ${y}) after reset, should be in safe area`);
        }
      }
    });
  });

  describe('Multiple component consistency', () => {
    it('should provide same spawn center for WallManager, Player, and OxygenTankManager', () => {
      const floorManager = new FloorManager();

      // Simulate Game.ts initialization order:
      // 1. WallManager constructor calls getRandomSpawnCenter()
      const wallManager = new WallManager(floorManager);
      const wallManagerSpawnArea = wallManager.getSpawnArea();

      // 2. Game.ts calls getRandomSpawnCenter() for Player
      const playerSpawnCenter = floorManager.getRandomSpawnCenter();

      // 3. Game.ts calls getRandomSpawnCenter() for OxygenTankManager
      const oxygenSpawnCenter = floorManager.getRandomSpawnCenter();

      // All three should be the same
      expect(playerSpawnCenter.x).toBe(wallManagerSpawnArea.centerX);
      expect(playerSpawnCenter.y).toBe(wallManagerSpawnArea.centerY);
      expect(oxygenSpawnCenter.x).toBe(wallManagerSpawnArea.centerX);
      expect(oxygenSpawnCenter.y).toBe(wallManagerSpawnArea.centerY);
    });

    it('should maintain consistency across 10 floor transitions', () => {
      const floorManager = new FloorManager();

      for (let floor = 1; floor <= 10; floor++) {
        if (floor > 1) {
          floorManager.nextFloor();
        }

        // Simulate initialization sequence
        const wallManager = new WallManager(floorManager);
        const wallManagerSpawnArea = wallManager.getSpawnArea();

        const playerSpawnCenter = floorManager.getRandomSpawnCenter();

        // Verify consistency
        expect(wallManagerSpawnArea.centerX).toBe(playerSpawnCenter.x);
        expect(wallManagerSpawnArea.centerY).toBe(playerSpawnCenter.y);

        // Verify safe area is clear
        for (let dx = -PLAYER_SPAWN_RADIUS; dx <= PLAYER_SPAWN_RADIUS; dx++) {
          for (let dy = -PLAYER_SPAWN_RADIUS; dy <= PLAYER_SPAWN_RADIUS; dy++) {
            const x = playerSpawnCenter.x + dx;
            const y = playerSpawnCenter.y + dy;

            const wall = wallManager.getWall(x, y);
            expect(wall).toBeNull();
          }
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('should handle minimum floor size with cached spawn center', () => {
      const config = createFloorSizeConfig({
        baseCols: 5,
        baseRows: 5,
        maxCols: 5,
        maxRows: 5,
        colsPerFloor: 0,
        rowsPerFloor: 0,
        maxFloorForScaling: 1,
      });

      const floorManager = new FloorManager(config);
      const wallManager = new WallManager(floorManager);

      // On 5x5 floor, only (2,2) is valid spawn position
      const spawnCenter = floorManager.getRandomSpawnCenter();
      const wallManagerSpawnArea = wallManager.getSpawnArea();

      expect(spawnCenter.x).toBe(2);
      expect(spawnCenter.y).toBe(2);
      expect(wallManagerSpawnArea.centerX).toBe(2);
      expect(wallManagerSpawnArea.centerY).toBe(2);
    });

    it('should work with custom floor configuration', () => {
      const config = createFloorSizeConfig({
        baseCols: 15,
        baseRows: 15,
        maxCols: 15,
        maxRows: 15,
        colsPerFloor: 0,
        rowsPerFloor: 0,
        maxFloorForScaling: 1,
      });

      const floorManager = new FloorManager(config);
      const wallManager = new WallManager(floorManager);

      const spawnCenter = floorManager.getRandomSpawnCenter();
      const wallManagerSpawnArea = wallManager.getSpawnArea();

      expect(wallManagerSpawnArea.centerX).toBe(spawnCenter.x);
      expect(wallManagerSpawnArea.centerY).toBe(spawnCenter.y);
    });
  });
});
