import { describe, it, expect, beforeEach } from 'vitest';
import { FloorManager } from '../FloorManager';

describe('FloorManager Wall HP Distribution', () => {
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
  });

  describe('getWallHPDistribution', () => {
    describe('Floor 1', () => {
      it('should return distribution with HP 1-3 only', () => {
        const distribution = floorManager.getWallHPDistribution();
        expect(distribution).toBeDefined();
        expect(distribution.length).toBeGreaterThan(0);

        // All HP values should be 1, 2, or 3
        const maxHP = Math.max(...distribution.map(d => d.hp));
        expect(maxHP).toBeLessThanOrEqual(3);
      });

      it('should weight HP 1 at approximately 50%', () => {
        const distribution = floorManager.getWallHPDistribution();
        const totalWeight = distribution.reduce((sum, d) => sum + d.weight, 0);
        const hp1Entry = distribution.find(d => d.hp === 1);

        expect(hp1Entry).toBeDefined();
        if (hp1Entry) {
          const hp1Percentage = hp1Entry.weight / totalWeight;
          expect(hp1Percentage).toBeCloseTo(0.5, 1);
        }
      });
    });

    describe('Floor 5', () => {
      beforeEach(() => {
        // Advance to floor 5
        for (let i = 0; i < 4; i++) {
          floorManager.nextFloor();
        }
      });

      it('should include HP 4 walls', () => {
        const distribution = floorManager.getWallHPDistribution();
        const maxHP = Math.max(...distribution.map(d => d.hp));
        expect(maxHP).toBeGreaterThanOrEqual(4);
      });

      it('should still include lower HP walls', () => {
        const distribution = floorManager.getWallHPDistribution();
        const hpValues = distribution.map(d => d.hp);
        expect(hpValues).toContain(1);
        expect(hpValues).toContain(2);
        expect(hpValues).toContain(3);
      });
    });

    describe('Floor 10', () => {
      beforeEach(() => {
        // Advance to floor 10
        for (let i = 0; i < 9; i++) {
          floorManager.nextFloor();
        }
      });

      it('should include HP 10 walls', () => {
        const distribution = floorManager.getWallHPDistribution();
        const maxHP = Math.max(...distribution.map(d => d.hp));
        expect(maxHP).toBe(10);
      });

      it('should have reduced weight for HP 1 walls', () => {
        const distribution = floorManager.getWallHPDistribution();
        const totalWeight = distribution.reduce((sum, d) => sum + d.weight, 0);
        const hp1Entry = distribution.find(d => d.hp === 1);

        if (hp1Entry) {
          const hp1Percentage = hp1Entry.weight / totalWeight;
          // HP1 should be less than 50% on floor 10
          expect(hp1Percentage).toBeLessThan(0.5);
        }
      });
    });

    describe('Floor progression', () => {
      it('should increase max available HP as floors progress', () => {
        const floor1MaxHP = Math.max(...floorManager.getWallHPDistribution().map(d => d.hp));

        // Progress to floor 7
        for (let i = 0; i < 6; i++) {
          floorManager.nextFloor();
        }

        const floor7MaxHP = Math.max(...floorManager.getWallHPDistribution().map(d => d.hp));
        expect(floor7MaxHP).toBeGreaterThan(floor1MaxHP);
      });
    });
  });

  describe('generateWallHP', () => {
    it('should return a valid HP value', () => {
      const hp = floorManager.generateWallHP();
      expect(hp).toBeGreaterThanOrEqual(1);
      expect(hp).toBeLessThanOrEqual(10);
      expect(Number.isInteger(hp)).toBe(true);
    });

    it('should respect floor-based constraints on floor 1', () => {
      // On floor 1, HP should be 1-3
      const samples: number[] = [];
      for (let i = 0; i < 100; i++) {
        samples.push(floorManager.generateWallHP());
      }

      const maxHP = Math.max(...samples);
      expect(maxHP).toBeLessThanOrEqual(3);
    });

    it('should allow higher HP walls on higher floors', () => {
      // Advance to floor 10
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }

      const samples: number[] = [];
      for (let i = 0; i < 200; i++) {
        samples.push(floorManager.generateWallHP());
      }

      const maxHP = Math.max(...samples);
      // Should have generated at least some HP 4+ walls
      expect(maxHP).toBeGreaterThanOrEqual(4);
    });

    it('should generate HP 1 more frequently than HP 3 on floor 1', () => {
      const hp1Count = { count: 0 };
      const hp3Count = { count: 0 };

      for (let i = 0; i < 100; i++) {
        const hp = floorManager.generateWallHP();
        if (hp === 1) hp1Count.count++;
        if (hp === 3) hp3Count.count++;
      }

      // HP 1 should appear more often
      expect(hp1Count.count).toBeGreaterThan(hp3Count.count);
    });
  });

  describe('reset', () => {
    it('should reset floor to 1 and restore initial HP distribution', () => {
      // Advance floors
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }

      expect(floorManager.currentFloor).toBe(6);

      // Reset
      floorManager.reset();

      expect(floorManager.currentFloor).toBe(1);

      // HP distribution should be floor 1 again
      const distribution = floorManager.getWallHPDistribution();
      const maxHP = Math.max(...distribution.map(d => d.hp));
      expect(maxHP).toBeLessThanOrEqual(3);
    });
  });
});
