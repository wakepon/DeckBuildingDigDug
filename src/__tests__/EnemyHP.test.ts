import { describe, it, expect } from 'vitest';
import {
  ENEMY_HP,
  ELITE_HP_MULTIPLIER,
  FLOOR_ENEMY_HP_SCALE,
} from '../constants';

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
      const scaledHP = Math.ceil(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(1);
    });

    it('Floor 2 normal enemy HP should be 2 (1 * 1.2 = 1.2, ceil = 2)', () => {
      const floor = 2;
      const scaledHP = Math.ceil(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(2);
    });

    it('Floor 5 normal enemy HP should be 2 (1 * 1.8 = 1.8, ceil = 2)', () => {
      const floor = 5;
      const scaledHP = Math.ceil(ENEMY_HP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(2);
    });

    it('Floor 1 elite enemy HP should be 5', () => {
      const floor = 1;
      const baseEliteHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      const scaledHP = Math.ceil(baseEliteHP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(5);
    });

    it('Floor 2 elite enemy HP should be 6 (5 * 1.2 = 6, ceil = 6)', () => {
      const floor = 2;
      const baseEliteHP = ENEMY_HP * ELITE_HP_MULTIPLIER;
      const scaledHP = Math.ceil(baseEliteHP * (1 + FLOOR_ENEMY_HP_SCALE * (floor - 1)));
      expect(scaledHP).toBe(6);
    });
  });
});
