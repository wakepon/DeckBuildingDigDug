import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InputManager } from '../InputManager';
import { AUTO_AIM_TOGGLE_KEY } from '../constants';

describe('InputManager - Auto-aim toggle', () => {
  let inputManager: InputManager;

  // Helper to simulate key events
  function simulateKeyDown(code: string): void {
    const event = new KeyboardEvent('keydown', { code });
    window.dispatchEvent(event);
  }

  function simulateKeyUp(code: string): void {
    const event = new KeyboardEvent('keyup', { code });
    window.dispatchEvent(event);
  }

  beforeEach(() => {
    inputManager = new InputManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isAutoAimTogglePressed', () => {
    it('should return false when toggle key is not pressed', () => {
      expect(inputManager.isAutoAimTogglePressed()).toBe(false);
    });

    it('should return true when toggle key is pressed', () => {
      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.isAutoAimTogglePressed()).toBe(true);
    });

    it('should return false after toggle key is released', () => {
      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.isAutoAimTogglePressed()).toBe(true);

      simulateKeyUp(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.isAutoAimTogglePressed()).toBe(false);
    });
  });

  describe('wasAutoAimToggleJustPressed', () => {
    it('should return false when toggle key was never pressed', () => {
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(false);
    });

    it('should return true on the first frame toggle key is pressed', () => {
      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(true);
    });

    it('should return false on subsequent frames while key is held', () => {
      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(true);

      // Simulate frame end
      inputManager.updatePreviousKeys();

      // Key is still held down, but wasAutoAimToggleJustPressed should be false
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(false);
    });

    it('should return true again after key is released and pressed again', () => {
      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(true);

      inputManager.updatePreviousKeys();

      simulateKeyUp(AUTO_AIM_TOGGLE_KEY);
      inputManager.updatePreviousKeys();

      simulateKeyDown(AUTO_AIM_TOGGLE_KEY);
      expect(inputManager.wasAutoAimToggleJustPressed()).toBe(true);
    });
  });

  describe('lastMoveDirection', () => {
    it('should return zero vector initially', () => {
      const dir = inputManager.lastMoveDirection;
      expect(dir.x).toBe(0);
      expect(dir.y).toBe(0);
    });

    it('should update when player moves', () => {
      simulateKeyDown('KeyD'); // Move right
      inputManager.updateLastMoveDirection();

      const dir = inputManager.lastMoveDirection;
      expect(dir.x).toBe(1);
      expect(dir.y).toBe(0);
    });

    it('should retain last direction when player stops', () => {
      simulateKeyDown('KeyD'); // Move right
      inputManager.updateLastMoveDirection();

      simulateKeyUp('KeyD'); // Stop moving
      inputManager.updateLastMoveDirection();

      const dir = inputManager.lastMoveDirection;
      expect(dir.x).toBe(1);
      expect(dir.y).toBe(0);
    });

    it('should handle diagonal movement', () => {
      simulateKeyDown('KeyD'); // Move right
      simulateKeyDown('KeyW'); // Move up
      inputManager.updateLastMoveDirection();

      const dir = inputManager.lastMoveDirection;
      // Should be normalized diagonal
      expect(dir.x).toBeCloseTo(0.707, 2);
      expect(dir.y).toBeCloseTo(-0.707, 2);
    });
  });
});
