import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { InputManager } from '../InputManager';

describe('InputManager extensions', () => {
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
    // Clean up any lingering event listeners
    vi.restoreAllMocks();
  });

  describe('wasKeyJustPressed', () => {
    it('should return false for a key that was never pressed', () => {
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(false);
    });

    it('should return true on the first frame a key is pressed', () => {
      simulateKeyDown('KeyA');
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(true);
    });

    it('should return false on subsequent frames while key is held', () => {
      simulateKeyDown('KeyA');
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(true);

      // Call updatePreviousKeys to simulate frame end
      inputManager.updatePreviousKeys();

      // Key is still held down, but wasKeyJustPressed should be false
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(false);
    });

    it('should return true again after key is released and pressed again', () => {
      simulateKeyDown('KeyA');
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(true);

      inputManager.updatePreviousKeys();

      simulateKeyUp('KeyA');
      inputManager.updatePreviousKeys();

      simulateKeyDown('KeyA');
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(true);
    });
  });

  describe('isDebugKeyPressed', () => {
    it('should return false when no keys are pressed', () => {
      expect(inputManager.isDebugKeyPressed()).toBe(false);
    });

    it('should return false when only Shift is pressed', () => {
      simulateKeyDown('ShiftLeft');
      expect(inputManager.isDebugKeyPressed()).toBe(false);
    });

    it('should return false when only Digit1 is pressed', () => {
      simulateKeyDown('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(false);
    });

    it('should return true when ShiftLeft + Digit1 are both pressed', () => {
      simulateKeyDown('ShiftLeft');
      simulateKeyDown('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(true);
    });

    it('should return true when ShiftRight + Digit1 are both pressed', () => {
      simulateKeyDown('ShiftRight');
      simulateKeyDown('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(true);
    });

    it('should return false after releasing Shift', () => {
      simulateKeyDown('ShiftLeft');
      simulateKeyDown('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(true);

      simulateKeyUp('ShiftLeft');
      expect(inputManager.isDebugKeyPressed()).toBe(false);
    });

    it('should return false after releasing Digit1', () => {
      simulateKeyDown('ShiftLeft');
      simulateKeyDown('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(true);

      simulateKeyUp('Digit1');
      expect(inputManager.isDebugKeyPressed()).toBe(false);
    });
  });

  describe('wasDebugKeyJustPressed', () => {
    it('should return false when debug key was not just pressed', () => {
      expect(inputManager.wasDebugKeyJustPressed()).toBe(false);
    });

    it('should return true when Shift+1 is just pressed (Digit1 triggers)', () => {
      simulateKeyDown('ShiftLeft');
      inputManager.updatePreviousKeys();

      simulateKeyDown('Digit1');
      expect(inputManager.wasDebugKeyJustPressed()).toBe(true);
    });

    it('should return false on subsequent frames while keys are held', () => {
      simulateKeyDown('ShiftLeft');
      simulateKeyDown('Digit1');
      expect(inputManager.wasDebugKeyJustPressed()).toBe(true);

      inputManager.updatePreviousKeys();

      expect(inputManager.wasDebugKeyJustPressed()).toBe(false);
    });

    it('should return true again after releasing and pressing Digit1', () => {
      simulateKeyDown('ShiftLeft');
      simulateKeyDown('Digit1');
      inputManager.updatePreviousKeys();

      simulateKeyUp('Digit1');
      inputManager.updatePreviousKeys();

      simulateKeyDown('Digit1');
      expect(inputManager.wasDebugKeyJustPressed()).toBe(true);
    });
  });

  describe('updatePreviousKeys', () => {
    it('should copy current keys to previous keys', () => {
      simulateKeyDown('KeyA');
      simulateKeyDown('KeyB');

      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(true);
      expect(inputManager.wasKeyJustPressed('KeyB')).toBe(true);

      inputManager.updatePreviousKeys();

      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(false);
      expect(inputManager.wasKeyJustPressed('KeyB')).toBe(false);
    });

    it('should handle keys being released between frames', () => {
      simulateKeyDown('KeyA');
      inputManager.updatePreviousKeys();

      simulateKeyUp('KeyA');
      inputManager.updatePreviousKeys();

      // KeyA is now in neither current nor previous
      expect(inputManager.wasKeyJustPressed('KeyA')).toBe(false);
      expect(inputManager.isKeyDown('KeyA')).toBe(false);
    });
  });

  describe('existing functionality preservation', () => {
    it('should still track basic key presses with isKeyDown', () => {
      expect(inputManager.isKeyDown('KeyW')).toBe(false);
      simulateKeyDown('KeyW');
      expect(inputManager.isKeyDown('KeyW')).toBe(true);
      simulateKeyUp('KeyW');
      expect(inputManager.isKeyDown('KeyW')).toBe(false);
    });

    it('should still calculate moveDirection correctly', () => {
      simulateKeyDown('KeyW');
      expect(inputManager.moveDirection.y).toBe(-1);

      simulateKeyDown('KeyD');
      // Diagonal movement should be normalized
      expect(inputManager.moveDirection.x).toBeCloseTo(0.707, 2);
      expect(inputManager.moveDirection.y).toBeCloseTo(-0.707, 2);
    });
  });
});
