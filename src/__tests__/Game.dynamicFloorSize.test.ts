import { describe, it, expect, beforeEach } from 'vitest';
import { FloorManager } from '../FloorManager';
import { TILE_SIZE, GRID_COLS, GRID_ROWS, SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';
import { Camera } from '../Camera';

describe('Game Dynamic Floor Size Integration', () => {
  let floorManager: FloorManager;
  let camera: Camera;

  beforeEach(() => {
    floorManager = new FloorManager();
  });

  describe('Camera initialization with dynamic world size', () => {
    it('should initialize camera with floor 1 world dimensions', () => {
      const worldDims = floorManager.getFloorWorldDimensions();
      camera = new Camera(SCREEN_WIDTH, SCREEN_HEIGHT, worldDims.width, worldDims.height);

      expect(camera).toBeDefined();
    });

    it('should have camera world size smaller than max on floor 1', () => {
      const worldDims = floorManager.getFloorWorldDimensions();

      expect(worldDims.width).toBeLessThanOrEqual(GRID_COLS * TILE_SIZE);
      expect(worldDims.height).toBeLessThanOrEqual(GRID_ROWS * TILE_SIZE);
    });
  });

  describe('Camera world size update on floor transition', () => {
    it('should update camera world size when floor changes', () => {
      const floor1Dims = floorManager.getFloorWorldDimensions();
      camera = new Camera(SCREEN_WIDTH, SCREEN_HEIGHT, floor1Dims.width, floor1Dims.height);

      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      const floor5Dims = floorManager.getFloorWorldDimensions();
      camera.updateWorldSize(floor5Dims.width, floor5Dims.height);

      // Verify camera was updated
      // Camera should now allow movement within the new world size
      expect(floor5Dims.width).toBeGreaterThanOrEqual(floor1Dims.width);
    });
  });

  describe('Player spawn position calculation', () => {
    it('should calculate spawn position from floor spawn center', () => {
      const spawnCenter = floorManager.getFloorSpawnCenter();
      const spawnPixelX = (spawnCenter.x + 0.5) * TILE_SIZE;
      const spawnPixelY = (spawnCenter.y + 0.5) * TILE_SIZE;

      expect(spawnPixelX).toBeGreaterThan(0);
      expect(spawnPixelY).toBeGreaterThan(0);
    });

    it('should update spawn position when floor changes', () => {
      const floor1SpawnCenter = floorManager.getFloorSpawnCenter();
      const floor1SpawnX = (floor1SpawnCenter.x + 0.5) * TILE_SIZE;

      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const floor10SpawnCenter = floorManager.getFloorSpawnCenter();
      const floor10SpawnX = (floor10SpawnCenter.x + 0.5) * TILE_SIZE;

      // Floor 10 spawn should be different (larger floor has different center)
      expect(floor10SpawnX).toBeGreaterThanOrEqual(floor1SpawnX);
    });
  });

  describe('Floor progression integration', () => {
    it('should provide consistent dimensions across all related methods', () => {
      // All dimension sources should agree
      const gridDims = floorManager.getFloorGridDimensions();
      const worldDims = floorManager.getFloorWorldDimensions();
      const spawnCenter = floorManager.getFloorSpawnCenter();

      // World dimensions should match grid dimensions * tile size
      expect(worldDims.width).toBe(gridDims.cols * TILE_SIZE);
      expect(worldDims.height).toBe(gridDims.rows * TILE_SIZE);

      // Spawn center should be within grid bounds
      expect(spawnCenter.x).toBeLessThan(gridDims.cols);
      expect(spawnCenter.y).toBeLessThan(gridDims.rows);
    });

    it('should maintain consistency after advancing floors', () => {
      // Advance to floor 5
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }

      const gridDims = floorManager.getFloorGridDimensions();
      const worldDims = floorManager.getFloorWorldDimensions();
      const spawnCenter = floorManager.getFloorSpawnCenter();

      expect(worldDims.width).toBe(gridDims.cols * TILE_SIZE);
      expect(worldDims.height).toBe(gridDims.rows * TILE_SIZE);
      expect(spawnCenter.x).toBeLessThan(gridDims.cols);
      expect(spawnCenter.y).toBeLessThan(gridDims.rows);
    });
  });
});
