import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoAimSystem, Target, TargetType } from '../AutoAimSystem';
import { PlayerStats } from '../PlayerStats';
import { EventBus } from '../EventBus';

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
});
