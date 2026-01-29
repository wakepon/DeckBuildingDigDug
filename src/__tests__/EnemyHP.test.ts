import { describe, it, expect, beforeEach } from 'vitest';
import {
  ENEMY_HP,
  ELITE_HP_MULTIPLIER,
  FLOOR_ENEMY_HP_SCALE,
} from '../constants';
import { FloorManager } from '../FloorManager';

describe('Enemy HP Constants', () => {
  describe('ENEMY_HP', () => {
    it('should be 1 for normal enemies', () => {
      expect(ENEMY_HP).toBe(1);
    });
  });

  describe('Elite Enemy HP', () => {
    it('should be ENEMY_HP multiplied by ELITE_HP_MULTIPLIER (5)', () => {
      const eliteHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      expect(eliteHP).toBe(5);
    });

    it('ELITE_HP_MULTIPLIER should be 5', () => {
      expect(ELITE_HP_MULTIPLIER).toBe(5);
    });
  });

  describe('Floor Scaling', () => {
    it('should scale HP by 20% per floor', () => {
      expect(FLOOR_ENEMY_HP_SCALE).toBe(0.2);
    });

    it('Floor 1 normal enemy HP should be 1', () => {
      const floor = 1;
      const scaledHP = Math.floor(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(1);
    });

    it('Floor 2 normal enemy HP should be 1 (1 * 1.2 = 1.2, floor = 1)', () => {
      const floor = 2;
      const scaledHP = Math.floor(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(1);
    });

    it('Floor 5 normal enemy HP should be 1 (1 * 1.8 = 1.8, floor = 1)', () => {
      const floor = 5;
      const scaledHP = Math.floor(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(1);
    });

    it('Floor 1 elite enemy HP should be 5', () => {
      const floor = 1;
      const baseEliteHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      const scaledHP = Math.floor(baseEliteHP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(5);
    });

    it('Floor 2 elite enemy HP should be 6 (5 * 1.2 = 6, floor = 6)', () => {
      const floor = 2;
      const baseEliteHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      const scaledHP = Math.floor(baseEliteHP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(6);
    });
  });
});

describe('FloorManager.getEnemyHP', () => {
  let floorManager: FloorManager;

  beforeEach(() => {
    floorManager = new FloorManager();
  });

  describe('uses Math.floor for HP calculation', () => {
    it('Floor 1 should return HP 1', () => {
      expect(floorManager.getEnemyHP()).toBe(1);
    });

    it('Floor 2 should return HP 1 (1 * 1.2 = 1.2, floor = 1)', () => {
      floorManager.nextFloor();
      expect(floorManager.getEnemyHP()).toBe(1);
    });

    it('Floor 5 should return HP 1 (1 * 1.8 = 1.8, floor = 1)', () => {
      for (let i = 0; i < 4; i++) {
        floorManager.nextFloor();
      }
      expect(floorManager.getEnemyHP()).toBe(1);
    });

    it('Floor 6 should return HP 2 (1 * 2.0 = 2.0, floor = 2)', () => {
      for (let i = 0; i < 5; i++) {
        floorManager.nextFloor();
      }
      expect(floorManager.getEnemyHP()).toBe(2);
    });

    it('Floor 10 should return HP 2 (1 * 2.8 = 2.8, floor = 2)', () => {
      for (let i = 0; i < 9; i++) {
        floorManager.nextFloor();
      }
      expect(floorManager.getEnemyHP()).toBe(2);
    });
  });

  describe('reset restores floor 1 HP', () => {
    it('should return HP 1 after reset', () => {
      floorManager.nextFloor();
      floorManager.nextFloor();
      floorManager.reset();
      expect(floorManager.getEnemyHP()).toBe(1);
    });
  });
});
