import { describe, it, expect, beforeEach } from 'vitest';
import { AutoAimSystem, Target, TargetType } from '../AutoAimSystem';

// Test the getTargets utility logic separately from BulletManager
// since BulletManager requires complex pixi.js mocking

describe('BulletManager Auto-aim target collection logic', () => {
  /**
   * This simulates what getTargets() would do in BulletManager
   * by taking enemies, elites, and wall centers and converting them to Target[]
   */
  function collectTargets(
    enemies: { x: number; y: number; active: boolean }[],
    elites: { x: number; y: number; active: boolean }[],
    wallCenters: { x: number; y: number }[]
  ): Target[] {
    const targets: Target[] = [];

    // Add active enemies
    for (const enemy of enemies) {
      if (enemy.active) {
        targets.push({ x: enemy.x, y: enemy.y, type: 'enemy' as TargetType });
      }
    }

    // Add active elite enemies
    for (const elite of elites) {
      if (elite.active) {
        targets.push({ x: elite.x, y: elite.y, type: 'enemy' as TargetType });
      }
    }

    // Add wall centers
    for (const wallCenter of wallCenters) {
      targets.push({ x: wallCenter.x, y: wallCenter.y, type: 'wall' as TargetType });
    }

    return targets;
  }

  describe('collectTargets (simulated getTargets logic)', () => {
    it('should return empty array when no enemies and no wall centers', () => {
      const targets = collectTargets([], [], []);
      expect(targets).toEqual([]);
    });

    it('should include active enemies in targets list', () => {
      const enemies = [{ x: 200, y: 100, active: true }];
      const targets = collectTargets(enemies, [], []);

      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({ x: 200, y: 100, type: 'enemy' });
    });

    it('should include active elite enemies in targets list', () => {
      const elites = [{ x: 300, y: 150, active: true }];
      const targets = collectTargets([], elites, []);

      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({ x: 300, y: 150, type: 'enemy' });
    });

    it('should include wall centers in targets list', () => {
      const wallCenters = [{ x: 250, y: 100 }];
      const targets = collectTargets([], [], wallCenters);

      expect(targets).toHaveLength(1);
      expect(targets[0]).toEqual({ x: 250, y: 100, type: 'wall' });
    });

    it('should exclude inactive enemies', () => {
      const enemies = [{ x: 200, y: 100, active: false }];
      const targets = collectTargets(enemies, [], []);

      expect(targets).toHaveLength(0);
    });

    it('should exclude inactive elite enemies', () => {
      const elites = [{ x: 300, y: 150, active: false }];
      const targets = collectTargets([], elites, []);

      expect(targets).toHaveLength(0);
    });

    it('should combine enemies and walls in targets list', () => {
      const enemies = [{ x: 200, y: 100, active: true }];
      const wallCenters = [{ x: 250, y: 100 }];
      const targets = collectTargets(enemies, [], wallCenters);

      expect(targets).toHaveLength(2);
      expect(targets).toContainEqual({ x: 200, y: 100, type: 'enemy' });
      expect(targets).toContainEqual({ x: 250, y: 100, type: 'wall' });
    });

    it('should include multiple enemies', () => {
      const enemies = [
        { x: 100, y: 100, active: true },
        { x: 200, y: 200, active: true },
        { x: 300, y: 300, active: false }, // inactive
      ];
      const targets = collectTargets(enemies, [], []);

      expect(targets).toHaveLength(2);
    });

    it('should combine enemies, elites, and walls', () => {
      const enemies = [{ x: 100, y: 100, active: true }];
      const elites = [{ x: 200, y: 200, active: true }];
      const wallCenters = [{ x: 300, y: 300 }];
      const targets = collectTargets(enemies, elites, wallCenters);

      expect(targets).toHaveLength(3);
      expect(targets.filter(t => t.type === 'enemy')).toHaveLength(2);
      expect(targets.filter(t => t.type === 'wall')).toHaveLength(1);
    });
  });

  describe('AutoAimSystem integration with collected targets', () => {
    let autoAimSystem: AutoAimSystem;

    beforeEach(() => {
      autoAimSystem = new AutoAimSystem();
    });

    it('should find closest enemy when targeting', () => {
      autoAimSystem.setEnabled(true);

      const enemies = [
        { x: 200, y: 0, active: true },
        { x: 100, y: 0, active: true }, // closest
        { x: 150, y: 0, active: true },
      ];
      const targets = collectTargets(enemies, [], []);

      const best = autoAimSystem.findBestTarget(0, 0, 1, 0, targets);

      expect(best).not.toBeNull();
      expect(best!.x).toBe(100);
    });

    it('should prioritize enemy over wall', () => {
      autoAimSystem.setEnabled(true);

      const enemies = [{ x: 150, y: 0, active: true }];
      const wallCenters = [{ x: 100, y: 0 }]; // closer, but wall
      const targets = collectTargets(enemies, [], wallCenters);

      const best = autoAimSystem.findBestTarget(0, 0, 1, 0, targets);

      expect(best).not.toBeNull();
      expect(best!.type).toBe('enemy');
      expect(best!.x).toBe(150);
    });

    it('should target wall when no enemies available', () => {
      autoAimSystem.setEnabled(true);

      const wallCenters = [{ x: 100, y: 0 }];
      const targets = collectTargets([], [], wallCenters);

      const best = autoAimSystem.findBestTarget(0, 0, 1, 0, targets);

      expect(best).not.toBeNull();
      expect(best!.type).toBe('wall');
    });

    it('should return null when auto-aim disabled', () => {
      // auto-aim is disabled by default
      const enemies = [{ x: 100, y: 0, active: true }];
      const targets = collectTargets(enemies, [], []);

      const best = autoAimSystem.findBestTarget(0, 0, 1, 0, targets);

      expect(best).toBeNull();
    });

    it('should return correct aim direction for target', () => {
      autoAimSystem.setEnabled(true);

      const enemies = [{ x: 100, y: 0, active: true }];
      const targets = collectTargets(enemies, [], []);

      const direction = autoAimSystem.getAimDirection(0, 0, 1, 0, targets);

      expect(direction.x).toBeCloseTo(1);
      expect(direction.y).toBeCloseTo(0);
    });
  });
});
