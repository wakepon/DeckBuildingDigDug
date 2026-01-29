import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoAimSystem, Target, TargetType } from '../AutoAimSystem';
import { PlayerStats } from '../PlayerStats';
import { EventBus } from '../EventBus';
import { InputManager } from '../InputManager';

describe('Auto-aim Integration', () => {
  describe('PlayerStats + AutoAimSystem sync', () => {
    let playerStats: PlayerStats;
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      playerStats = new PlayerStats();
      autoAimSystem = new AutoAimSystem();
    });

    it('should sync enabled state between PlayerStats and AutoAimSystem', () => {
      // Enable via PlayerStats
      playerStats.setAutoAimEnabled(true);
      autoAimSystem.setEnabled(playerStats.autoAimEnabled);

      expect(autoAimSystem.isEnabled).toBe(true);

      // Disable via PlayerStats
      playerStats.setAutoAimEnabled(false);
      autoAimSystem.setEnabled(playerStats.autoAimEnabled);

      expect(autoAimSystem.isEnabled).toBe(false);
    });

    it('should toggle correctly through PlayerStats', () => {
      // Initial state based on constant
      const initialState = playerStats.autoAimEnabled;

      // Toggle
      playerStats.toggleAutoAim();
      autoAimSystem.setEnabled(playerStats.autoAimEnabled);

      expect(autoAimSystem.isEnabled).toBe(!initialState);
    });
  });

  describe('EventBus AUTO_AIM_TOGGLED event', () => {
    let eventBus: EventBus;
    let playerStats: PlayerStats;
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      eventBus = new EventBus();
      playerStats = new PlayerStats();
      autoAimSystem = new AutoAimSystem();
    });

    it('should emit AUTO_AIM_TOGGLED event when toggled', () => {
      const callback = vi.fn();
      eventBus.on('AUTO_AIM_TOGGLED', callback);

      // Simulate toggle behavior
      const newState = playerStats.toggleAutoAim();
      eventBus.emit({ type: 'AUTO_AIM_TOGGLED', enabled: newState });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ type: 'AUTO_AIM_TOGGLED', enabled: newState });
    });

    it('should allow subscribing to auto-aim state changes', () => {
      let receivedState: boolean | null = null;

      eventBus.on('AUTO_AIM_TOGGLED', (event) => {
        receivedState = event.enabled;
        autoAimSystem.setEnabled(event.enabled);
      });

      // Emit toggle event
      eventBus.emit({ type: 'AUTO_AIM_TOGGLED', enabled: true });

      expect(receivedState).toBe(true);
      expect(autoAimSystem.isEnabled).toBe(true);
    });
  });

  describe('Full auto-aim targeting flow', () => {
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      autoAimSystem = new AutoAimSystem();
      autoAimSystem.setEnabled(true);
    });

    it('should find and aim at enemy in movement direction', () => {
      // Player at origin, moving right
      const playerX = 100;
      const playerY = 100;
      const moveX = 1;
      const moveY = 0;

      // Enemy directly in front
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const aimDir = autoAimSystem.getAimDirection(playerX, playerY, moveX, moveY, targets);

      expect(aimDir.x).toBeCloseTo(1);
      expect(aimDir.y).toBeCloseTo(0);
    });

    it('should prioritize enemy over wall', () => {
      const playerX = 100;
      const playerY = 100;
      const moveX = 1;
      const moveY = 0;

      const targets: Target[] = [
        { x: 150, y: 100, type: 'wall' as TargetType }, // closer wall
        { x: 200, y: 100, type: 'enemy' as TargetType } // enemy
      ];

      const best = autoAimSystem.findBestTarget(playerX, playerY, moveX, moveY, targets);

      expect(best).not.toBeNull();
      expect(best!.type).toBe('enemy');
    });

    it('should fall back to movement direction when no targets', () => {
      const playerX = 100;
      const playerY = 100;
      const moveX = 0.707; // diagonal movement
      const moveY = 0.707;

      const targets: Target[] = [];

      const aimDir = autoAimSystem.getAimDirection(playerX, playerY, moveX, moveY, targets);

      // Should be normalized movement direction
      expect(aimDir.x).toBeCloseTo(0.707, 2);
      expect(aimDir.y).toBeCloseTo(0.707, 2);
    });

    it('should not target enemies outside cone', () => {
      const playerX = 100;
      const playerY = 100;
      const moveX = 1;
      const moveY = 0;

      // Enemy behind player
      const targets: Target[] = [
        { x: 50, y: 100, type: 'enemy' as TargetType }
      ];

      const best = autoAimSystem.findBestTarget(playerX, playerY, moveX, moveY, targets);

      expect(best).toBeNull();
    });

    it('should target closest enemy when multiple in cone', () => {
      const playerX = 100;
      const playerY = 100;
      const moveX = 1;
      const moveY = 0;

      const targets: Target[] = [
        { x: 250, y: 100, type: 'enemy' as TargetType },
        { x: 150, y: 100, type: 'enemy' as TargetType }, // closest
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const best = autoAimSystem.findBestTarget(playerX, playerY, moveX, moveY, targets);

      expect(best).not.toBeNull();
      expect(best!.x).toBe(150);
    });
  });

  describe('Manual vs Auto-aim mode switching', () => {
    let playerStats: PlayerStats;
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      playerStats = new PlayerStats();
      autoAimSystem = new AutoAimSystem();
    });

    it('should use manual aiming when auto-aim disabled', () => {
      playerStats.setAutoAimEnabled(false);
      autoAimSystem.setEnabled(playerStats.autoAimEnabled);

      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      // findBestTarget returns null when disabled
      const best = autoAimSystem.findBestTarget(100, 100, 1, 0, targets);
      expect(best).toBeNull();
    });

    it('should use auto-aim when enabled', () => {
      playerStats.setAutoAimEnabled(true);
      autoAimSystem.setEnabled(playerStats.autoAimEnabled);

      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType }
      ];

      const best = autoAimSystem.findBestTarget(100, 100, 1, 0, targets);
      expect(best).not.toBeNull();
    });
  });

  describe('Mouse-based auto-aim integration', () => {
    let inputManager: InputManager;
    let autoAimSystem: AutoAimSystem;
    let playerStats: PlayerStats;

    beforeEach(() => {
      inputManager = new InputManager();
      autoAimSystem = new AutoAimSystem();
      playerStats = new PlayerStats();
      playerStats.setAutoAimEnabled(true);
      autoAimSystem.setEnabled(true);
    });

    it('should integrate InputManager.getMouseDirection with AutoAimSystem', () => {
      // Set mouse position
      (inputManager as unknown as { _mouseX: number })._mouseX = 300;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at (100, 100), camera at (0, 0)
      const playerX = 100;
      const playerY = 100;
      const cameraX = 0;
      const cameraY = 0;

      // Get mouse direction from InputManager
      const mouseDir = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      // Enemy in front of mouse direction
      const targets: Target[] = [
        { x: 250, y: 100, type: 'enemy' as TargetType }
      ];

      // Use mouse direction for auto-aim
      const aimDir = autoAimSystem.getAimDirection(playerX, playerY, mouseDir.x, mouseDir.y, targets);

      // Should aim at enemy
      expect(aimDir.x).toBeCloseTo(1);
      expect(aimDir.y).toBeCloseTo(0);
    });

    it('should correctly handle camera offset in mouse-based targeting', () => {
      // Mouse at screen (200, 100)
      (inputManager as unknown as { _mouseX: number })._mouseX = 200;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at (100, 100), camera offset (-100, 0) means player moved right from start
      // Correct formula: worldX = screenX - cameraX
      // Mouse world position = (200 - (-100), 100 - 0) = (300, 100)
      // Direction from player (100, 100) to mouse (300, 100) = (200, 0), normalized (1, 0)
      const mouseDir = inputManager.getMouseDirection(100, 100, -100, 0);

      // Mouse is to the right of player
      expect(mouseDir.x).toBeCloseTo(1);
      expect(mouseDir.y).toBeCloseTo(0);
    });

    it('should work with camera offset and target detection', () => {
      // Mouse at screen (400, 100)
      (inputManager as unknown as { _mouseX: number })._mouseX = 400;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      // Player at world (200, 100), camera offset (100, 0)
      // Correct formula: worldX = screenX - cameraX
      // So mouse world = (400 - 100, 100 - 0) = (300, 100)
      // Direction from player (200, 100) to mouse (300, 100) = (100, 0), normalized (1, 0)
      const mouseDir = inputManager.getMouseDirection(200, 100, 100, 0);

      expect(mouseDir.x).toBeCloseTo(1);
      expect(mouseDir.y).toBeCloseTo(0);

      // Enemy at (350, 100) - in the cone
      const targets: Target[] = [
        { x: 350, y: 100, type: 'enemy' as TargetType }
      ];

      const best = autoAimSystem.findBestTarget(200, 100, mouseDir.x, mouseDir.y, targets);
      expect(best).not.toBeNull();
      expect(best!.x).toBe(350);
    });

    it('should simulate full BulletManager auto-aim flow', () => {
      // This test simulates what BulletManager.fire() does
      // 1. Get mouse direction
      // 2. If zero, don't fire
      // 3. Get targets
      // 4. Get aim direction

      // Set up mouse pointing to the right
      (inputManager as unknown as { _mouseX: number })._mouseX = 300;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      const playerX = 100;
      const playerY = 100;
      const cameraX = 0;
      const cameraY = 0;

      // Step 1: Get mouse direction
      const mouseDir = inputManager.getMouseDirection(playerX, playerY, cameraX, cameraY);

      // Step 2: Check if zero (it's not)
      expect(mouseDir.x !== 0 || mouseDir.y !== 0).toBe(true);

      // Step 3: Get targets (simulated)
      const targets: Target[] = [
        { x: 200, y: 100, type: 'enemy' as TargetType },
        { x: 150, y: 80, type: 'wall' as TargetType }
      ];

      // Step 4: Get aim direction using mouse direction
      const aimDir = autoAimSystem.getAimDirection(
        playerX,
        playerY,
        mouseDir.x,
        mouseDir.y,
        targets
      );

      // Should prioritize enemy and aim at it
      expect(aimDir.x).toBeCloseTo(1);
      expect(aimDir.y).toBeCloseTo(0);
    });

    it('should not fire when mouse is at player position', () => {
      // Mouse at same position as player (after camera calculation)
      (inputManager as unknown as { _mouseX: number })._mouseX = 100;
      (inputManager as unknown as { _mouseY: number })._mouseY = 100;

      const mouseDir = inputManager.getMouseDirection(100, 100, 0, 0);

      // Should be zero - don't fire
      expect(mouseDir.x).toBe(0);
      expect(mouseDir.y).toBe(0);

      // In BulletManager, this would cause early return
    });
  });
});
