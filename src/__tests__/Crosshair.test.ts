import { describe, it, expect, beforeEach } from 'vitest';
import { Crosshair } from '../Crosshair';
import { InputManager } from '../InputManager';

describe('Crosshair', () => {
  let crosshair: Crosshair;
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
    crosshair = new Crosshair(inputManager);
  });

  it('should create a container', () => {
    expect(crosshair.container).toBeDefined();
  });

  it('should update position to match mouse coordinates', () => {
    // Set mouse position via private property access (for testing)
    (inputManager as any)._mouseX = 100;
    (inputManager as any)._mouseY = 200;

    crosshair.update();

    expect(crosshair.container.x).toBe(100);
    expect(crosshair.container.y).toBe(200);
  });

  it('should update position when mouse moves', () => {
    // Initial position
    (inputManager as any)._mouseX = 50;
    (inputManager as any)._mouseY = 75;
    crosshair.update();
    expect(crosshair.container.x).toBe(50);
    expect(crosshair.container.y).toBe(75);

    // Move mouse
    (inputManager as any)._mouseX = 150;
    (inputManager as any)._mouseY = 250;
    crosshair.update();
    expect(crosshair.container.x).toBe(150);
    expect(crosshair.container.y).toBe(250);
  });

  it('should handle zero coordinates', () => {
    (inputManager as any)._mouseX = 0;
    (inputManager as any)._mouseY = 0;

    crosshair.update();

    expect(crosshair.container.x).toBe(0);
    expect(crosshair.container.y).toBe(0);
  });

  it('should handle negative coordinates', () => {
    (inputManager as any)._mouseX = -50;
    (inputManager as any)._mouseY = -100;

    crosshair.update();

    expect(crosshair.container.x).toBe(-50);
    expect(crosshair.container.y).toBe(-100);
  });
});
