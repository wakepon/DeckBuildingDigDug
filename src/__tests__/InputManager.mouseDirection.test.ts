import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager } from '../InputManager';

describe('InputManager - getMouseDirection', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMouseDirection', () => {
    it('should return normalized direction from player to mouse', () => {
      // Set mouse position to screen coordinates (200, 100)
      // Accessing private member for testing - we'll set via reflection
      (inputManager as unknown as { _mouseX: number })._mouseX = 200;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at world position (100, 100), camera at (0, 0)
      // Mouse world position = screen position - camera offset = (200, 100)
      // Direction = (200-100, 100-100) = (100, 0), normalized = (1, 0)
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir.x).toBeCloseTo(1);
      expect(dir.y).toBeCloseTo(0);
    });

    it('should handle camera offset correctly', () => {
      // Mouse at screen (300, 200)
      (inputManager as unknown as { _mouseX: number })._mouseX = 300;
      (inputManager as unknown as { _mouseY: number })._mouseY = 200;

      // Camera offset is (-100, -50), meaning camera moved right and down
      // Mouse world position = screen + camera offset = (300 + (-100), 200 + (-50)) = (200, 150)
      // Player at (100, 100)
      // Direction = (200-100, 150-100) = (100, 50)
      // Length = sqrt(100^2 + 50^2) = sqrt(12500) = ~111.8
      // Normalized = (100/111.8, 50/111.8) = (~0.894, ~0.447)
      const dir = inputManager.getMouseDirection(100, 100, -100, -50);

      const expectedLength = Math.sqrt(100 * 100 + 50 * 50);
      expect(dir.x).toBeCloseTo(100 / expectedLength, 3);
      expect(dir.y).toBeCloseTo(50 / expectedLength, 3);
    });

    it('should return zero vector when mouse is at player position', () => {
      // Mouse at screen (100, 100)
      (inputManager as unknown as { _mouseX: number })._mouseX = 100;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at (100, 100), camera at (0, 0)
      // Mouse world position = (100, 100)
      // Direction = (0, 0) - zero length
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir.x).toBe(0);
      expect(dir.y).toBe(0);
    });

    it('should return zero vector when mouse has not been initialized (0, 0)', () => {
      // Mouse at default (0, 0)
      (inputManager as unknown as { _mouseX: number })._mouseX = 0;
      (inputManager as unknown as { _mouseY: number })._mouseY = 0;

      // Player at (0, 0), camera at (0, 0)
      const dir = inputManager.getMouseDirection(0, 0, 0, 0);

      expect(dir.x).toBe(0);
      expect(dir.y).toBe(0);
    });

    it('should handle diagonal direction with proper normalization', () => {
      // Mouse at screen (200, 200)
      (inputManager as unknown as { _mouseX: number })._mouseX = 200;
      (inputManager as unknown as { _mouseY: number })._mouseY = 200;

      // Player at (100, 100), camera at (0, 0)
      // Direction = (100, 100), normalized = (0.707, 0.707)
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir.x).toBeCloseTo(0.707, 2);
      expect(dir.y).toBeCloseTo(0.707, 2);
    });

    it('should handle negative direction (mouse behind player)', () => {
      // Mouse at screen (50, 50)
      (inputManager as unknown as { _mouseX: number })._mouseX = 50;
      (inputManager as unknown as { _mouseY: number })._mouseY = 50;

      // Player at (100, 100), camera at (0, 0)
      // Direction = (-50, -50), normalized = (-0.707, -0.707)
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir.x).toBeCloseTo(-0.707, 2);
      expect(dir.y).toBeCloseTo(-0.707, 2);
    });

    it('should handle positive camera offset', () => {
      // Mouse at screen (200, 200)
      (inputManager as unknown as { _mouseX: number })._mouseX = 200;
      (inputManager as unknown as { _mouseY: number })._mouseY = 200;

      // Camera offset is (50, 50), meaning camera moved left and up
      // Mouse world position = screen + camera = (200 + 50, 200 + 50) = (250, 250)
      // Player at (100, 100)
      // Direction = (150, 150), normalized = (0.707, 0.707)
      const dir = inputManager.getMouseDirection(100, 100, 50, 50);

      expect(dir.x).toBeCloseTo(0.707, 2);
      expect(dir.y).toBeCloseTo(0.707, 2);
    });

    it('should handle very small distance (near zero but not zero)', () => {
      // Mouse at screen (100.001, 100)
      (inputManager as unknown as { _mouseX: number })._mouseX = 100.001;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at (100, 100), camera at (0, 0)
      // Very small positive x direction
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      // Should normalize even tiny distances
      expect(dir.x).toBeCloseTo(1);
      expect(dir.y).toBeCloseTo(0);
    });

    it('should return zero vector for extremely small distance', () => {
      // Mouse at screen (100.00001, 100.00001) - practically at player position
      (inputManager as unknown as { _mouseX: number })._mouseX = 100.00001;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100.00001;

      // Player at (100, 100), camera at (0, 0)
      // Distance is 0.0000141..., which is below threshold
      const dir = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir.x).toBe(0);
      expect(dir.y).toBe(0);
    });
  });

  describe('getMouseDirection immutability', () => {
    it('should return a new object on each call', () => {
      (inputManager as unknown as { _mouseX: number })._mouseX = 200;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      const dir1 = inputManager.getMouseDirection(100, 100, 0, 0);
      const dir2 = inputManager.getMouseDirection(100, 100, 0, 0);

      expect(dir1).not.toBe(dir2);
      expect(dir1.x).toBe(dir2.x);
      expect(dir1.y).toBe(dir2.y);
    });
  });
});
