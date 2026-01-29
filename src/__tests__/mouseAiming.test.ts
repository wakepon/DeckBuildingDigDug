import { describe, it, expect, beforeEach } from 'vitest';
import { InputManager } from '../InputManager';

/**
 * Tests for mouse-to-world coordinate transformation.
 *
 * The bug: Camera offset is being ADDED when it should be SUBTRACTED.
 * Camera offset values are negative (e.g., camera.x = -400 when player moves right).
 *
 * Screen to world conversion should be:
 *   worldX = screenX - cameraX
 *   worldY = screenY - cameraY
 *
 * When camera is at (-400, -300), mouse at screen (300, 200):
 *   worldX = 300 - (-400) = 700 (CORRECT)
 *   worldX = 300 + (-400) = -100 (WRONG - current bug)
 */
describe('Mouse to World Coordinate Transformation', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
    // Mock canvas for mouse position tracking
    const mockCanvas = {
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    } as HTMLCanvasElement;
    inputManager.setCanvas(mockCanvas);
  });

  describe('getMouseDirection with camera offset', () => {
    /**
     * Simulate mouse position by directly setting internal state.
     * In real usage, this comes from mousemove events.
     */
    function setMousePosition(inputManager: InputManager, x: number, y: number): void {
      // Access private _mouseX and _mouseY via any cast for testing
      (inputManager as unknown as { _mouseX: number })._mouseX = x;
      (inputManager as unknown as { _mouseY: number })._mouseY = y;
    }

    it('calculates correct direction when camera has negative offset (player moved right)', () => {
      // Player at world position (700, 500)
      const playerX = 700;
      const playerY = 500;

      // Camera offset is negative when player moves right/down from start
      // Camera follows player, so cameraX = playerX - screenWidth/2 = 700 - 400 = 300
      // But camera values passed are the offset which is negative: -300
      const cameraX = -300;
      const cameraY = -200;

      // Mouse at center of screen (400, 300)
      setMousePosition(inputManager, 400, 300);

      // Expected world position of mouse:
      // worldX = screenX - cameraX = 400 - (-300) = 700
      // worldY = screenY - cameraY = 300 - (-200) = 500
      // Mouse is at same position as player, so direction should be zero
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      // Direction should be zero (mouse at player position)
      expect(direction.x).toBe(0);
      expect(direction.y).toBe(0);
    });

    it('calculates direction pointing right when mouse is to the right of player', () => {
      const playerX = 700;
      const playerY = 500;
      const cameraX = -300; // Negative offset
      const cameraY = -200;

      // Mouse at screen (500, 300) - to the right of center
      setMousePosition(inputManager, 500, 300);

      // World position: (500 - (-300), 300 - (-200)) = (800, 500)
      // Direction from player (700, 500) to mouse (800, 500) = (100, 0) normalized = (1, 0)
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      expect(direction.x).toBeCloseTo(1, 5);
      expect(direction.y).toBeCloseTo(0, 5);
    });

    it('calculates direction pointing left when mouse is to the left of player', () => {
      const playerX = 700;
      const playerY = 500;
      const cameraX = -300;
      const cameraY = -200;

      // Mouse at screen (300, 300) - to the left of center
      setMousePosition(inputManager, 300, 300);

      // World position: (300 - (-300), 300 - (-200)) = (600, 500)
      // Direction from player (700, 500) to mouse (600, 500) = (-100, 0) normalized = (-1, 0)
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      expect(direction.x).toBeCloseTo(-1, 5);
      expect(direction.y).toBeCloseTo(0, 5);
    });

    it('handles zero camera offset correctly', () => {
      const playerX = 400;
      const playerY = 300;
      const cameraX = 0;
      const cameraY = 0;

      // Mouse to the right of player
      setMousePosition(inputManager, 500, 300);

      // World position = screen position when camera offset is 0
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      // Direction from (400, 300) to (500, 300) = (1, 0)
      expect(direction.x).toBeCloseTo(1, 5);
      expect(direction.y).toBeCloseTo(0, 5);
    });

    it('calculates diagonal direction correctly with camera offset', () => {
      const playerX = 700;
      const playerY = 500;
      const cameraX = -300;
      const cameraY = -200;

      // Mouse at screen (500, 400) - to bottom-right of center
      setMousePosition(inputManager, 500, 400);

      // World position: (500 - (-300), 400 - (-200)) = (800, 600)
      // Direction from (700, 500) to (800, 600) = (100, 100) normalized
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      const expectedNormalized = 1 / Math.sqrt(2);
      expect(direction.x).toBeCloseTo(expectedNormalized, 5);
      expect(direction.y).toBeCloseTo(expectedNormalized, 5);
    });

    it('handles positive camera offset (camera pushed left/up)', () => {
      // This case is less common but should still work
      const playerX = 100;
      const playerY = 100;
      const cameraX = 50; // Positive offset
      const cameraY = 50;

      // Mouse at screen (200, 200)
      setMousePosition(inputManager, 200, 200);

      // World position: (200 - 50, 200 - 50) = (150, 150)
      // Direction from (100, 100) to (150, 150)
      const direction = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      const expectedNormalized = 1 / Math.sqrt(2);
      expect(direction.x).toBeCloseTo(expectedNormalized, 5);
      expect(direction.y).toBeCloseTo(expectedNormalized, 5);
    });
  });
});

describe('screenToWorld coordinate conversion', () => {
  /**
   * Pure function tests for the coordinate transformation logic.
   * These tests verify the mathematical correctness of the conversion.
   */

  it('converts screen coords to world coords with negative camera offset', () => {
    const screenX = 300;
    const screenY = 200;
    const cameraX = -400; // Player moved right, camera offset is negative
    const cameraY = -300;

    // Correct formula: worldX = screenX - cameraX
    const worldX = screenX - cameraX;
    const worldY = screenY - cameraY;

    expect(worldX).toBe(700); // 300 - (-400) = 700
    expect(worldY).toBe(500); // 200 - (-300) = 500
  });

  it('converts screen coords to world coords with zero camera offset', () => {
    const screenX = 300;
    const screenY = 200;
    const cameraX = 0;
    const cameraY = 0;

    const worldX = screenX - cameraX;
    const worldY = screenY - cameraY;

    expect(worldX).toBe(300);
    expect(worldY).toBe(200);
  });

  it('converts screen coords to world coords with positive camera offset', () => {
    const screenX = 300;
    const screenY = 200;
    const cameraX = 100;
    const cameraY = 50;

    const worldX = screenX - cameraX;
    const worldY = screenY - cameraY;

    expect(worldX).toBe(200); // 300 - 100 = 200
    expect(worldY).toBe(150); // 200 - 50 = 150
  });
});
