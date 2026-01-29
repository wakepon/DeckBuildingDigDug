import { describe, it, expect, beforeEach } from 'vitest';
import { Camera } from '../Camera';

describe('Camera', () => {
  // Test configuration constants
  const SCREEN_WIDTH = 800;
  const SCREEN_HEIGHT = 600;
  const WORLD_WIDTH = 1600;  // 2x screen width for scrolling
  const WORLD_HEIGHT = 1200; // 2x screen height for scrolling

  let camera: Camera;

  beforeEach(() => {
    camera = new Camera(SCREEN_WIDTH, SCREEN_HEIGHT, WORLD_WIDTH, WORLD_HEIGHT);
  });

  describe('constructor', () => {
    it('should initialize camera position at origin', () => {
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);
    });

    it('should store screen dimensions', () => {
      expect(camera.screenWidth).toBe(SCREEN_WIDTH);
      expect(camera.screenHeight).toBe(SCREEN_HEIGHT);
    });

    it('should store world dimensions', () => {
      expect(camera.worldWidth).toBe(WORLD_WIDTH);
      expect(camera.worldHeight).toBe(WORLD_HEIGHT);
    });
  });

  describe('follow', () => {
    it('should center on target when target is in middle of world', () => {
      const targetX = WORLD_WIDTH / 2;  // 800
      const targetY = WORLD_HEIGHT / 2; // 600

      camera.follow(targetX, targetY);

      // Camera x should offset to center target on screen
      // Expected: SCREEN_WIDTH/2 - targetX = 400 - 800 = -400
      expect(camera.x).toBe(-400);
      // Expected: SCREEN_HEIGHT/2 - targetY = 300 - 600 = -300
      expect(camera.y).toBe(-300);
    });

    it('should clamp to left edge when target is near left side', () => {
      const targetX = 100;  // Near left edge
      const targetY = WORLD_HEIGHT / 2;

      camera.follow(targetX, targetY);

      // Without clamping: 400 - 100 = 300 (positive, would show beyond world)
      // With clamping: maxX = 0
      expect(camera.x).toBe(0);
    });

    it('should clamp to right edge when target is near right side', () => {
      const targetX = WORLD_WIDTH - 100;  // Near right edge (1500)
      const targetY = WORLD_HEIGHT / 2;

      camera.follow(targetX, targetY);

      // Without clamping: 400 - 1500 = -1100 (would show beyond world)
      // With clamping: minX = SCREEN_WIDTH - WORLD_WIDTH = 800 - 1600 = -800
      expect(camera.x).toBe(-800);
    });

    it('should clamp to top edge when target is near top', () => {
      const targetX = WORLD_WIDTH / 2;
      const targetY = 100;  // Near top edge

      camera.follow(targetX, targetY);

      // Without clamping: 300 - 100 = 200 (positive, would show beyond world)
      // With clamping: maxY = 0
      expect(camera.y).toBe(0);
    });

    it('should clamp to bottom edge when target is near bottom', () => {
      const targetX = WORLD_WIDTH / 2;
      const targetY = WORLD_HEIGHT - 100;  // Near bottom edge (1100)

      camera.follow(targetX, targetY);

      // Without clamping: 300 - 1100 = -800 (would show beyond world)
      // With clamping: minY = SCREEN_HEIGHT - WORLD_HEIGHT = 600 - 1200 = -600
      expect(camera.y).toBe(-600);
    });

    it('should clamp to corner when target is in corner', () => {
      // Top-left corner
      camera.follow(0, 0);
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);

      // Bottom-right corner
      camera.follow(WORLD_WIDTH, WORLD_HEIGHT);
      expect(camera.x).toBe(-800); // SCREEN_WIDTH - WORLD_WIDTH
      expect(camera.y).toBe(-600); // SCREEN_HEIGHT - WORLD_HEIGHT
    });
  });

  describe('edge cases', () => {
    it('should handle world same size as screen (no scrolling)', () => {
      const smallCamera = new Camera(800, 600, 800, 600);

      smallCamera.follow(400, 300);

      // When world equals screen, camera should stay at 0,0
      expect(smallCamera.x).toBe(0);
      expect(smallCamera.y).toBe(0);
    });

    it('should center world smaller than screen on both axes', () => {
      // World is 400x300, screen is 800x600
      // World should be centered: offset = (screen - world) / 2
      const smallWorldCamera = new Camera(800, 600, 400, 300);

      smallWorldCamera.follow(200, 150);

      // Expected: x = (800 - 400) / 2 = 200 (centers 400px world in 800px screen)
      // Expected: y = (600 - 300) / 2 = 150 (centers 300px world in 600px screen)
      expect(smallWorldCamera.x).toBe(200);
      expect(smallWorldCamera.y).toBe(150);
    });

    it('should keep small world centered regardless of player position', () => {
      // World is smaller than screen - should always be centered
      const smallWorldCamera = new Camera(800, 600, 400, 300);

      // Player at different positions within small world
      smallWorldCamera.follow(0, 0);
      expect(smallWorldCamera.x).toBe(200);
      expect(smallWorldCamera.y).toBe(150);

      smallWorldCamera.follow(400, 300);
      expect(smallWorldCamera.x).toBe(200);
      expect(smallWorldCamera.y).toBe(150);

      smallWorldCamera.follow(200, 150);
      expect(smallWorldCamera.x).toBe(200);
      expect(smallWorldCamera.y).toBe(150);
    });

    it('should center world smaller in one dimension only (width smaller)', () => {
      // Width smaller than screen (640 < 800), height larger (700 > 600)
      const camera = new Camera(800, 600, 640, 700);

      camera.follow(320, 350);

      // X: world < screen, should center: (800 - 640) / 2 = 80
      expect(camera.x).toBe(80);
      // Y: world > screen, should use normal clamping
      // desiredY = 300 - 350 = -50, minY = 600 - 700 = -100, maxY = 0
      // clamped: Math.max(-100, Math.min(0, -50)) = -50
      expect(camera.y).toBe(-50);
    });

    it('should center world smaller in one dimension only (height smaller)', () => {
      // Width larger than screen (1000 > 800), height smaller (440 < 600)
      const camera = new Camera(800, 600, 1000, 440);

      camera.follow(500, 220);

      // X: world > screen, should use normal clamping
      // desiredX = 400 - 500 = -100, minX = 800 - 1000 = -200, maxX = 0
      // clamped: Math.max(-200, Math.min(0, -100)) = -100
      expect(camera.x).toBe(-100);
      // Y: world < screen, should center: (600 - 440) / 2 = 80
      expect(camera.y).toBe(80);
    });

    it('should center Floor 1 sized world (640x440)', () => {
      // Floor 1: 16 tiles * 40px = 640px width, 11 tiles * 40px = 440px height
      // Both dimensions smaller than 800x600 screen
      const floor1Camera = new Camera(800, 600, 640, 440);

      // Player at center of floor
      floor1Camera.follow(320, 220);

      // Expected: x = (800 - 640) / 2 = 80
      // Expected: y = (600 - 440) / 2 = 80
      expect(floor1Camera.x).toBe(80);
      expect(floor1Camera.y).toBe(80);
    });

    it('should handle negative target coordinates', () => {
      camera.follow(-100, -100);

      // Should clamp to top-left corner
      expect(camera.x).toBe(0);
      expect(camera.y).toBe(0);
    });

    it('should handle target beyond world bounds', () => {
      camera.follow(WORLD_WIDTH + 500, WORLD_HEIGHT + 500);

      // Should clamp to bottom-right corner
      expect(camera.x).toBe(-800);
      expect(camera.y).toBe(-600);
    });
  });

  describe('worldToScreen coordinate conversion', () => {
    it('should convert world coordinates to screen coordinates', () => {
      camera.follow(800, 600); // Camera at center of world

      // World position (800, 600) should be at screen center
      const screenPos = camera.worldToScreen(800, 600);
      expect(screenPos.x).toBe(400); // SCREEN_WIDTH / 2
      expect(screenPos.y).toBe(300); // SCREEN_HEIGHT / 2
    });

    it('should correctly offset coordinates after camera movement', () => {
      camera.follow(800, 600);
      // Camera.x = -400, Camera.y = -300

      // World position (0, 0) should be offset by camera
      const screenPos = camera.worldToScreen(0, 0);
      expect(screenPos.x).toBe(-400); // 0 + camera.x
      expect(screenPos.y).toBe(-300); // 0 + camera.y
    });
  });

  describe('screenToWorld coordinate conversion', () => {
    it('should convert screen coordinates to world coordinates', () => {
      camera.follow(800, 600);
      // Camera.x = -400, Camera.y = -300

      // Screen center should map to world (800, 600)
      const worldPos = camera.screenToWorld(400, 300);
      expect(worldPos.x).toBe(800);
      expect(worldPos.y).toBe(600);
    });

    it('should be inverse of worldToScreen', () => {
      camera.follow(600, 400);

      const worldX = 500;
      const worldY = 350;

      const screenPos = camera.worldToScreen(worldX, worldY);
      const backToWorld = camera.screenToWorld(screenPos.x, screenPos.y);

      expect(backToWorld.x).toBe(worldX);
      expect(backToWorld.y).toBe(worldY);
    });
  });

  describe('updateWorldSize', () => {
    it('should update world dimensions', () => {
      camera.updateWorldSize(2000, 1500);

      expect(camera.worldWidth).toBe(2000);
      expect(camera.worldHeight).toBe(1500);
    });

    it('should re-clamp position after world size change', () => {
      // Position camera at bottom-right
      camera.follow(1500, 1100);
      expect(camera.x).toBe(-800); // Clamped to min

      // Shrink world
      camera.updateWorldSize(1000, 800);

      // minX is now: 800 - 1000 = -200
      // Camera should be re-clamped
      expect(camera.x).toBe(-200);
    });

    it('should center when updated to world smaller than screen', () => {
      // Start with large world
      camera.follow(800, 600);
      expect(camera.x).toBe(-400);
      expect(camera.y).toBe(-300);

      // Update to small world (Floor 1 size)
      camera.updateWorldSize(640, 440);

      // Should center the small world
      // x = (800 - 640) / 2 = 80
      // y = (600 - 440) / 2 = 80
      expect(camera.x).toBe(80);
      expect(camera.y).toBe(80);
    });

    it('should handle mixed dimension update (one smaller, one larger)', () => {
      camera.follow(800, 600);

      // Update to world with width smaller, height larger
      camera.updateWorldSize(640, 1200);

      // X: world < screen, center: (800 - 640) / 2 = 80
      expect(camera.x).toBe(80);
      // Y: world > screen, clamp: current _y should be re-clamped
      // Previous _y was -300, minY = 600 - 1200 = -600, maxY = 0
      // -300 is within bounds, should stay at -300
      expect(camera.y).toBe(-300);
    });
  });
});
